"""
Plant disease detection blueprint.

    POST /predict-disease   multipart/form-data, field "image"
    GET  /disease/status    cheap readiness check (does not load the model)
"""

import logging

from flask import Blueprint, jsonify, request

from disease_detection.predict_disease import (
    InvalidImageError,
    ModelNotAvailableError,
    model_status,
    predict_disease,
)

log = logging.getLogger(__name__)

disease_bp = Blueprint("disease", __name__)

MAX_IMAGE_BYTES = 8 * 1024 * 1024  # the frontend resizes photos, so this is generous


@disease_bp.route("/predict-disease", methods=["POST"])
def predict_disease_route():
    upload = request.files.get("image")
    if upload is None or not upload.filename:
        return jsonify({"error": "Please choose a leaf photo to analyse."}), 400

    image_bytes = upload.read(MAX_IMAGE_BYTES + 1)
    if not image_bytes:
        return jsonify({"error": "The uploaded file is empty."}), 400
    if len(image_bytes) > MAX_IMAGE_BYTES:
        return jsonify({"error": "Image is too large. Please use a photo under 8 MB."}), 413

    try:
        return jsonify(predict_disease(image_bytes))
    except InvalidImageError as err:
        return jsonify({"error": str(err)}), 400
    except ModelNotAvailableError as err:
        log.error("Disease model unavailable: %s", err)
        return jsonify({"error": "Disease detection is temporarily unavailable. Please try again later."}), 503
    except Exception:
        log.exception("Disease prediction failed")
        return jsonify({"error": "Something went wrong while analysing the photo. Please try again."}), 500


@disease_bp.route("/disease/status", methods=["GET"])
def disease_status_route():
    try:
        return jsonify(model_status())
    except Exception:
        log.exception("Disease status check failed")
        return jsonify({"error": "Status unavailable."}), 500
