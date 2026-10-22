"""
Plant disease inference for Krishi AI (MobileNetV2 image classifier).

Design notes
------------
* The model is loaded lazily, on the first prediction, so the web server boots
  quickly and TensorFlow's memory is only used when someone scans a leaf.
* Everything that depends on how the model was trained (input size, pixel
  scaling, confidence threshold) lives in model/model_config.json, so nothing
  here needs editing when the training setup is confirmed.
* The list of class names (class_names.json) MUST be in the same order the
  model was trained with. See README_DISEASE.md.

Command line check (run from the Backend folder):
    python -m disease_detection.predict_disease --info
    python -m disease_detection.predict_disease path/to/leaf.jpg
"""

import importlib
import io
import json
import logging
import os
import threading

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

log = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")
CONFIG_PATH = os.path.join(MODEL_DIR, "model_config.json")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")
DISEASE_INFO_PATH = os.path.join(BASE_DIR, "disease_info.json")
MODEL_EXTENSIONS = (".keras", ".h5", ".tflite")

DEFAULT_CONFIG = {
    "model_file": "",
    "input_size": 224,
    # "mobilenet_v2": x / 127.5 - 1   (keras mobilenet_v2.preprocess_input)
    # "rescale":      x / 255
    # "none":         raw 0-255 values (the model has its own scaling layer)
    "preprocessing": "mobilenet_v2",
    "confidence_threshold": 0.60,
    "top_k": 3,
}

DISCLAIMER = (
    "This is an AI-assisted suggestion, not a laboratory diagnosis. "
    "Confirm with your local Krishi Vigyan Kendra or agriculture officer before "
    "spraying any chemical, and always follow the product label for dose and "
    "pre-harvest interval."
)

GENERIC_ADVICE = {
    "symptoms": "No detailed notes are stored for this condition yet.",
    "organic_remedies": [
        "Remove and destroy badly affected leaves away from the field.",
        "Avoid overhead irrigation and improve airflow between plants.",
    ],
    "chemical_remedies": [
        "Ask your local agriculture officer for an approved product, dose and spray interval."
    ],
    "prevention": [
        "Use certified seed or seedlings and rotate crops each season.",
        "Keep tools and field borders clean.",
    ],
}

HEALTHY_ADVICE = {
    "symptoms": "No visible signs of disease on this leaf.",
    "organic_remedies": [],
    "chemical_remedies": [],
    "prevention": [
        "Keep scouting the field every few days, especially after rain or humid weather.",
        "Maintain balanced nutrition and avoid water standing on leaves overnight.",
        "Remove any weeds around the crop that can host pests and diseases.",
    ],
}


class InvalidImageError(ValueError):
    """The uploaded file is not a readable image."""


class ModelNotAvailableError(RuntimeError):
    """The model file is missing or could not be loaded."""


# ---------------------------------------------------------------- config files

_cache = {}


def _load_json(path):
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def load_config():
    if "config" not in _cache:
        cfg = dict(DEFAULT_CONFIG)
        if os.path.exists(CONFIG_PATH):
            cfg.update({k: v for k, v in _load_json(CONFIG_PATH).items() if not k.startswith("_")})
        _cache["config"] = cfg
    return _cache["config"]


def load_class_names():
    if "classes" not in _cache:
        classes = _load_json(CLASS_NAMES_PATH)
        if not isinstance(classes, list) or not classes:
            raise RuntimeError("class_names.json must be a non-empty JSON list.")
        _cache["classes"] = classes
    return _cache["classes"]


def load_disease_info():
    if "info" not in _cache:
        _cache["info"] = _load_json(DISEASE_INFO_PATH) if os.path.exists(DISEASE_INFO_PATH) else {}
    return _cache["info"]


# ------------------------------------------------------------- label handling

def _clean(text):
    return " ".join(text.replace("_", " ").split())


def parse_label(label):
    """'Tomato___Early_blight' -> ('Tomato', 'Early blight')."""
    crop_raw, _, disease_raw = label.partition("___")
    return _clean(crop_raw), _clean(disease_raw)


def is_healthy(label):
    return label.strip().lower().endswith("healthy")


# ------------------------------------------------------------ model discovery

def find_model_path():
    override = os.environ.get("DISEASE_MODEL_PATH")
    if override:
        return override if os.path.exists(override) else None

    named = load_config().get("model_file")
    if named:
        path = os.path.join(MODEL_DIR, named)
        return path if os.path.exists(path) else None

    if os.path.isdir(MODEL_DIR):
        for name in sorted(os.listdir(MODEL_DIR)):
            if name.lower().endswith(MODEL_EXTENSIONS):
                return os.path.join(MODEL_DIR, name)
    return None


# -------------------------------------------------------------------- runners

class _KerasRunner:
    def __init__(self, path):
        import tensorflow as tf  # heavy import, done lazily on purpose

        self._model = tf.keras.models.load_model(path, compile=False)

    def predict(self, batch):
        return np.asarray(self._model(batch, training=False))[0]

    def describe(self):
        return {
            "kind": "keras",
            "input_shape": str(self._model.input_shape),
            "output_shape": str(self._model.output_shape),
        }


class _TFLiteRunner:
    def __init__(self, path):
        interpreter_cls = self._interpreter_class()
        self._interp = interpreter_cls(model_path=path)
        self._interp.allocate_tensors()
        self._in = self._interp.get_input_details()[0]
        self._out = self._interp.get_output_details()[0]
        if self._in["dtype"] != np.float32:
            raise ModelNotAvailableError(
                "This TFLite model expects %s input; only float32 models are supported. "
                "Re-export without full-integer quantization." % self._in["dtype"]
            )

    @staticmethod
    def _interpreter_class():
        # Prefer the small standalone runtimes; fall back to full TensorFlow.
        for module_name in ("ai_edge_litert.interpreter", "tflite_runtime.interpreter"):
            try:
                return importlib.import_module(module_name).Interpreter
            except ImportError:
                continue
        import tensorflow as tf

        return tf.lite.Interpreter

    def predict(self, batch):
        self._interp.set_tensor(self._in["index"], batch.astype(np.float32))
        self._interp.invoke()
        return np.asarray(self._interp.get_tensor(self._out["index"]))[0]

    def describe(self):
        return {
            "kind": "tflite",
            "input_shape": str([int(d) for d in self._in["shape"]]),
            "output_shape": str([int(d) for d in self._out["shape"]]),
        }


_runner = None
_load_lock = threading.Lock()
_infer_lock = threading.Lock()


def get_runner():
    """Load the model once and reuse it for every request."""
    global _runner
    if _runner is not None:
        return _runner
    with _load_lock:
        if _runner is not None:
            return _runner
        path = find_model_path()
        if not path:
            raise ModelNotAvailableError(
                "Disease model file not found. Place the trained MobileNetV2 model "
                "(.keras, .h5 or .tflite) in Backend/disease_detection/model/."
            )
        log.info("Loading disease model from %s", path)
        try:
            if path.lower().endswith(".tflite"):
                _runner = _TFLiteRunner(path)
            else:
                _runner = _KerasRunner(path)
        except ModelNotAvailableError:
            raise
        except Exception as exc:  # corrupt file, version mismatch, ...
            log.exception("Could not load disease model")
            raise ModelNotAvailableError(
                "The disease model could not be loaded (%s). Re-save it as a .keras "
                "file or export a .tflite from the training environment." % type(exc).__name__
            ) from exc
        return _runner


# -------------------------------------------------------------- preprocessing

def preprocess_image(image_bytes, cfg=None):
    """Bytes of any common image format -> float32 batch of shape (1, S, S, 3)."""
    cfg = cfg or load_config()
    size = int(cfg["input_size"])
    try:
        probe = Image.open(io.BytesIO(image_bytes))
        probe.verify()  # cheap integrity check; invalidates the object
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)  # phone photos carry rotation in EXIF
        img = img.convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError, SyntaxError, Image.DecompressionBombError) as exc:
        raise InvalidImageError("Could not read this file as an image. Please upload a JPG or PNG photo.") from exc

    # Keras image_dataset_from_directory resizes without keeping aspect ratio
    # (bilinear), so we do the same to match what the model saw in training.
    img = img.resize((size, size), Image.BILINEAR)
    x = np.asarray(img, dtype=np.float32)

    mode = str(cfg.get("preprocessing", "mobilenet_v2")).lower()
    if mode == "mobilenet_v2":
        x = x / 127.5 - 1.0
    elif mode == "rescale":
        x = x / 255.0
    elif mode != "none":
        raise RuntimeError("Unknown preprocessing mode in model_config.json: %r" % mode)

    return np.expand_dims(x, axis=0)


def _to_probabilities(raw):
    raw = np.asarray(raw, dtype=np.float64).reshape(-1)
    if raw.min() < 0 or abs(raw.sum() - 1.0) > 1e-2:  # logits -> softmax
        raw = raw - raw.max()
        raw = np.exp(raw)
        raw = raw / raw.sum()
    return raw


# ----------------------------------------------------------------- prediction

def _entry(label, confidence):
    crop, disease = parse_label(label)
    info = load_disease_info().get(label, {})
    healthy = is_healthy(label)
    display = info.get("display_name") or ("Healthy" if healthy else disease)
    return {
        "label": label,
        "crop": crop,
        "disease": disease,
        "display_name": display,
        "is_healthy": healthy,
        "confidence": round(float(confidence), 4),
        "confidence_pct": round(float(confidence) * 100, 1),
    }


def predict_disease(image_bytes):
    """Classify a leaf photo. Returns a JSON-serialisable dict."""
    cfg = load_config()
    classes = load_class_names()

    batch = preprocess_image(image_bytes, cfg)  # fail fast on a bad image
    runner = get_runner()
    with _infer_lock:
        raw = runner.predict(batch)

    if raw.reshape(-1).shape[0] != len(classes):
        raise ModelNotAvailableError(
            "Model outputs %d classes but class_names.json lists %d. "
            "Use the class list from the same training run as the model."
            % (raw.reshape(-1).shape[0], len(classes))
        )

    probs = _to_probabilities(raw)
    order = np.argsort(probs)[::-1][: max(1, int(cfg["top_k"]))]
    top = [_entry(classes[i], probs[i]) for i in order]
    best = top[0]

    advice_src = load_disease_info().get(best["label"])
    if advice_src is None:
        advice_src = HEALTHY_ADVICE if best["is_healthy"] else GENERIC_ADVICE
    advice = {
        "symptoms": advice_src.get("symptoms", ""),
        "organic_remedies": advice_src.get("organic_remedies", []),
        "chemical_remedies": advice_src.get("chemical_remedies", []),
        "prevention": advice_src.get("prevention", []),
    }

    confident = best["confidence"] >= float(cfg["confidence_threshold"])
    return {
        "status": "ok" if confident else "uncertain",
        "prediction": best,
        "top_predictions": top,
        "advice": advice,
        "disclaimer": DISCLAIMER,
    }


def model_status():
    """Cheap status check that never loads the model."""
    path = find_model_path()
    cfg = load_config()
    return {
        "model_file_found": bool(path),
        "model_file": os.path.basename(path) if path else None,
        "model_loaded": _runner is not None,
        "num_classes": len(load_class_names()),
        "input_size": cfg["input_size"],
        "preprocessing": cfg["preprocessing"],
        "confidence_threshold": cfg["confidence_threshold"],
    }


# ------------------------------------------------------------------------ CLI

if __name__ == "__main__":
    import argparse
    import pprint

    parser = argparse.ArgumentParser(description="Test the plant disease model locally.")
    parser.add_argument("image", nargs="?", help="path to a leaf photo")
    parser.add_argument("--info", action="store_true", help="print model input/output shapes")
    args = parser.parse_args()

    try:
        if args.info:
            pprint.pprint(model_status())
            pprint.pprint(get_runner().describe())
            print("class_names.json entries:", len(load_class_names()))
            no_advice = [c for c in load_class_names() if not is_healthy(c) and c not in load_disease_info()]
            if no_advice:
                print("Classes with no entry in disease_info.json (generic advice will be shown):")
                for c in no_advice:
                    print("  -", c)
            else:
                print("Every disease class has advice in disease_info.json.")
        if args.image:
            with open(args.image, "rb") as fh:
                pprint.pprint(predict_disease(fh.read()))
    except (ModelNotAvailableError, InvalidImageError, OSError) as err:
        print("PROBLEM:", err)
        raise SystemExit(1)
    if not args.info and not args.image:
        parser.print_help()
