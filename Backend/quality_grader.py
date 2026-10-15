"""
AI-assisted visual quality grading for crop harvest photos.

Produces a transparent, buyer-friendly bilingual (EN/HI) grading report
for the KrishiAI farmer-to-buyer marketplace.

IMPORTANT: This is AI-assisted visual grading only.
It is NOT lab-certified and NOT government-certified.
"""

import datetime as _dt
import io
import re

import numpy as np
from PIL import Image, ImageOps

MAX_SIDE = 640
DISCLAIMER = "AI-assisted visual grading only; not lab-certified or government-certified."

# --------------------------------------------------------------------------- #
# Crop name localisation (English -> Hindi, for buyer-facing text)
# --------------------------------------------------------------------------- #

_HINDI_CROP_MAP = {
    "red onion": "\u0932\u093e\u0932 \u092a\u094d\u092f\u093e\u091c",
    "onion": "\u092a\u094d\u092f\u093e\u091c",
    "onions": "\u092a\u094d\u092f\u093e\u091c",
    "tomato": "\u091f\u092e\u093e\u091f\u0930",
    "potato": "\u0906\u0932\u0942",
    "rice": "\u091a\u093e\u0935\u0932",
    "wheat": "\u0917\u0947\u0939\u0942\u0902",
    "maize": "\u092e\u0915\u094d\u0915\u093e",
    "corn": "\u092e\u0915\u094d\u0915\u093e",
    "cotton": "\u0915\u092a\u093e\u0938",
    "sugarcane": "\u0917\u0928\u094d\u0928\u093e",
    "grape": "\u0905\u0902\u0917\u0942\u0930",
    "grapes": "\u0905\u0902\u0917\u0942\u0930",
    "mango": "\u0906\u092e",
    "banana": "\u0915\u0947\u0932\u093e",
    "soybean": "\u0938\u094b\u092f\u093e\u092c\u0940\u0928",
    "groundnut": "\u092e\u0942\u0902\u0917\u092b\u0932\u0940",
    "peanut": "\u092e\u0942\u0902\u0917\u092b\u0932\u0940",
    "mustard": "\u0938\u0930\u0938\u094b\u0902",
    "cabbage": "\u092a\u0924\u094d\u0924\u093e\u0917\u094b\u092d\u0940",
    "cauliflower": "\u092b\u0942\u0932\u0917\u094b\u092d\u0940",
    "carrot": "\u0917\u093e\u091c\u0930",
    "chilli": "\u092e\u093f\u0930\u094d\u091a",
    "chili": "\u092e\u093f\u0930\u094d\u091a",
    "ginger": "\u0905\u0926\u0930\u0915",
    "garlic": "\u0932\u0939\u0938\u0941\u0928",
    "turmeric": "\u0939\u0932\u094d\u0926\u0940",
    "lentil": "\u092e\u0938\u0942\u0930",
    "masoor": "\u092e\u0938\u0942\u0930",
    "chickpea": "\u091a\u0928\u093e",
    "gram": "\u091a\u0928\u093e",
    "pigeon pea": "\u0905\u0930\u0939\u0930",
    "brinjal": "\u092c\u0948\u0902\u0917\u0928",
    "eggplant": "\u092c\u0948\u0902\u0917\u0928",
    "okra": "\u092d\u093f\u0902\u0921\u0940",
    "spinach": "\u092a\u093e\u0932\u0915",
    "pea": "\u092e\u091f\u0930",
    "peas": "\u092e\u091f\u0930",
    "apple": "\u0938\u0947\u092c",
    "orange": "\u0938\u0902\u0924\u0930\u093e",
    "banana fruit": "\u0915\u0947\u0932\u093e",
    "paddy": "\u0927\u093e\u0928",
    "barley": "\u091c\u094c",
    "millet": "\u092e\u093f\u0932",
    "bajra": "\u092c\u093e\u091c\u0930\u093e",
    "jowar": "\u091c\u094d\u0935\u093e\u0930",
}


def hindi_crop_name(crop_name: str) -> str:
    """Return Hindi crop name; use Devanagari already present in input if any."""
    if not crop_name:
        return ""
    m = re.search(r"[\u0900-\u097F]+(?:\s+[\u0900-\u097F]+)*", crop_name)
    if m and len(m.group(0)) >= 2:
        return m.group(0).strip()
    plain = re.sub(r"\([^)]*\)", "", crop_name).strip().lower()
    if plain in _HINDI_CROP_MAP:
        return _HINDI_CROP_MAP[plain]
    for key, hindi in _HINDI_CROP_MAP.items():
        if key in plain:
            return hindi
    return plain


def english_crop_name(crop_name: str) -> str:
    if not crop_name:
        return "produce"
    plain = re.sub(r"[\(\u0900-\u097F][^\)]*\)", "", crop_name).strip()
    plain = re.sub(r"[\u0900-\u097F]+", "", plain).strip(" ,()-")
    return plain or crop_name.strip()


# --------------------------------------------------------------------------- #
# Computer-vision pre-analysis of the uploaded harvest photo
# --------------------------------------------------------------------------- #

def analyze_image(image_bytes: bytes) -> dict:
    """Compute brightness, sharpness (blur score), color uniformity and
    defect metrics from a harvest photo. Returns internal analysis dict."""
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)
    if img.mode != "RGB":
        img = img.convert("RGB")

    width, height = img.size
    small = img.copy()
    small.thumbnail((MAX_SIDE, MAX_SIDE))

    arr = np.asarray(small, dtype=np.float32)          # 0..255, H x W x 3
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    luma = 0.299 * r + 0.587 * g + 0.114 * b

    brightness = float(luma.mean())

    # Sharpness: 99th-percentile gradient across ALL colour channels on a
    # lightly smoothed copy. Using colour (not luma-only) gradients matters
    # because red produce on a dark/soil background often has almost equal
    # luma. Percentile (not mean) keeps the score independent of how many
    # edges the scene contains; box smoothing suppresses sensor noise so
    # only real edges contribute.
    edge_strength = np.zeros(luma.shape, dtype=np.float32)
    for i in range(3):
        ch = arr[..., i]
        sm = ch.copy()
        sm[1:-1, 1:-1] = (ch[:-2, 1:-1] + ch[2:, 1:-1]
                          + ch[1:-1, :-2] + ch[1:-1, 2:]
                          + 4.0 * ch[1:-1, 1:-1]) / 8.0
        cy, cx = np.gradient(sm / 255.0)
        edge_strength += cy * cy + cx * cx
    grad = np.sqrt(edge_strength)
    edge_sharp = float(np.percentile(grad, 99))
    grad_mean = float(grad.mean())
    blur_score = float(np.clip((edge_sharp - 0.02) * 400.0, 0, 100))

    # Exposure clipping
    clip_hi = float((luma > 250).mean())
    clip_lo = float((luma < 12).mean())
    luma_std = float(luma.std())
    channel_stds = [float(arr[..., i].std()) for i in range(3)]
    color_std = float(np.mean(channel_stds))
    luma_range = float(np.percentile(luma, 98) - np.percentile(luma, 2))
    color_range = float(np.mean([
        np.percentile(arr[..., i], 98) - np.percentile(arr[..., i], 2)
        for i in range(3)
    ]))

    # Chromatic produce mask (fallback to luma band for pale produce)
    hsv = np.asarray(small.convert("HSV"), dtype=np.float32)
    h_ch, s_ch, v_ch = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    sat_frac = float((s_ch > 50).mean())
    if sat_frac >= 0.12:
        mask = (s_ch > 50) & (v_ch > 25)
    else:
        lo, hi = np.percentile(luma, 8), np.percentile(luma, 93)
        mask = (luma >= lo) & (luma <= hi)
    if int(mask.sum()) < 120:
        mask = np.ones(luma.shape, dtype=bool)

    # Dominant produce colour + spread -> color uniformity
    med_rgb = np.array([float(np.median(arr[..., i][mask])) for i in range(3)])
    dist = np.sqrt(((arr - med_rgb) ** 2).sum(axis=-1))
    d_masked = dist[mask]
    mean_dist = float(d_masked.mean())
    color_uniformity = float(np.clip(100.0 - (mean_dist - 14.0) * 0.85, 0, 100))

    # Surface defects: dark spots (bruising/shrivelling) + off-colour patches
    v_masked = v_ch[mask]
    med_v = float(np.median(v_masked))
    dark_ratio = float((v_masked < max(med_v * 0.60, 30)).mean())
    outlier_cut = max(75.0, mean_dist * 2.3)
    colour_outlier_ratio = float((d_masked > outlier_cut).mean())
    blemish_ratio = float(min(1.0, dark_ratio * 0.85 + colour_outlier_ratio * 0.85))

    # Soil / dust residue heuristic (brown, low-value, moderate saturation)
    brown = ((h_ch >= 8) & (h_ch <= 38) & (s_ch >= 30) & (s_ch <= 170)
             & (v_ch >= 45) & (v_ch <= 165))
    soil_ratio = float(brown[mask].mean()) if mask.any() else 0.0

    # Overall photo quality band
    if (blur_score >= 45 and 45 <= brightness <= 225
            and clip_hi < 0.20 and clip_lo < 0.20
            and color_std >= 14 and max(luma_range, color_range) >= 45):
        quality = "good"
    elif (blur_score >= 28 and 30 <= brightness <= 238
            and clip_hi < 0.35 and clip_lo < 0.35 and color_std >= 8):
        quality = "fair"
    else:
        quality = "poor"

    return {
        "brightness": round(brightness, 1),
        "blur_score": round(blur_score, 1),
        "color_uniformity": round(color_uniformity, 1),
        "quality": quality,
        "width": width,
        "height": height,
        "min_side": min(width, height),
        "luma_std": round(luma_std, 1),
        "color_std": round(color_std, 1),
        "color_range": round(color_range, 1),
        "grad_mean": round(grad_mean, 4),
        "edge_sharp": round(edge_sharp, 4),
        "clip_hi": round(clip_hi, 4),
        "clip_lo": round(clip_lo, 4),
        "blemish_ratio": round(blemish_ratio, 4),
        "dark_ratio": round(dark_ratio, 4),
        "soil_ratio": round(soil_ratio, 4),
        "sat_fraction": round(sat_frac, 4),
    }


# --------------------------------------------------------------------------- #
# Harvest-date parsing for freshness estimation
# --------------------------------------------------------------------------- #

def _days_since_harvest(harvest_date: str) -> int | None:
    if not harvest_date:
        return None
    text = str(harvest_date)
    m = re.search(r"(\d+)\s*(?:day|days|din|\u0926\u093f\u0928)", text, re.I)
    if m:
        return int(m.group(1))
    m = re.search(r"(\d+)\s*(?:week|weeks|hafta)", text, re.I)
    if m:
        return int(m.group(1)) * 7
    m = re.search(r"(\d+)\s*(?:month|months|\u092e\u0939\u0940\u0928\u0947)", text, re.I)
    if m:
        return int(m.group(1)) * 30
    m = re.search(r"(\d{4})-(\d{1,2})-(\d{1,2})", text)
    if m:
        try:
            d = _dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
            return (_dt.date.today() - d).days
        except ValueError:
            return None
    m = re.search(r"(\d{1,2})[/-](\d{1,2})[/-](\d{4})", text)
    if m:
        try:
            d = _dt.date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
            return (_dt.date.today() - d).days
        except ValueError:
            return None
    return None


def _freshness_label(days: int | None, analysis: dict | None) -> str:
    if days is not None:
        if days <= 5:
            return "Freshly Harvested"
        if days <= 20:
            return "Good"
        if days <= 45:
            return "Wilting"
        return "Stale"
    if analysis:
        if analysis.get("quality") == "good" and analysis.get("color_uniformity", 0) >= 70:
            return "Good"
        if analysis.get("quality") == "poor" or analysis.get("blemish_ratio", 0) > 0.35:
            return "Stale"
        return "Good"
    return "Good"


# --------------------------------------------------------------------------- #
# Grading helper predicates
# --------------------------------------------------------------------------- #

def _blemish_label(ratio: float) -> str:
    if ratio < 0.05:
        return "None"
    if ratio < 0.15:
        return "Minor"
    if ratio < 0.30:
        return "Moderate"
    return "Severe"


def _uniformity_label(value: float) -> str:
    if value >= 80:
        return "High"
    if value >= 60:
        return "Medium"
    return "Low"


def _foreign_matter_label(soil_ratio: float, dark_ratio: float) -> str:
    score = soil_ratio * 0.7 + dark_ratio * 0.5
    if score < 0.10:
        return "Clean"
    if score < 0.30:
        return "Moderate"
    return "High"


def _photo_review_reasons(a: dict) -> list[str]:
    reasons = []
    if a["min_side"] < 200:
        reasons.append("photo resolution too low")
    if a["blur_score"] < 32:
        reasons.append("photo is blurry")
    if a["brightness"] < 40:
        reasons.append("photo is underexposed")
    if a["brightness"] > 232:
        reasons.append("photo is overexposed")
    if a["clip_hi"] > 0.25 or a["clip_lo"] > 0.25:
        reasons.append("severe light/dark clipping hides produce detail")
    if a.get("color_std", 30) < 10 or a.get("color_range", 60) < 35:
        reasons.append("produce is not clearly visible in frame")
    return reasons


_REVIEW_REASON_HI = {
    "photo resolution too low": "\u0924\u0938\u094d\u0935\u0940\u0930 \u0930\u093f\u091c\u093c\u094b\u0932\u094d\u092f\u0941\u0936\u0928 \u092c\u0939\u0941\u0924 \u0915\u092e \u0939\u0948",
    "photo is blurry": "\u0924\u0938\u094d\u0935\u0940\u0930 \u0927\u0941\u0902\u0926\u094b\u0902 \u0939\u0948",
    "photo is underexposed": "\u0924\u0938\u094d\u0935\u0940\u0930 \u092e\u0947\u0902 \u0930\u094b\u0936\u0928\u0940 \u0915\u092e \u0939\u0948",
    "photo is overexposed": "\u0924\u0938\u094d\u0935\u0940\u0930 \u092e\u0947\u0902 \u0924\u0947\u091c \u0930\u094b\u0936\u0928\u0940 \u0939\u0948",
    "severe light/dark clipping hides produce detail":
        "\u0924\u0947\u091c\u093c/\u0905\u0902\u0927\u093e\u0930\u0947 \u0915\u0947 \u0915\u093e\u0930\u0923 \u0938\u0947 \u092c\u093e\u0930\u0940\u0915 \u092c\u094d\u0930\u093f\u091f \u091b\u093f\u092a \u0939\u0941\u0908 \u0939\u0948",
    "produce is not clearly visible in frame":
        "\u092a\u094d\u0930\u0938\u094d\u0924\u093e\u0935 \u0938\u093e\u092b\u093c \u0926\u093f\u0916\u093e\u0908 \u0928\u0939\u0940\u0902 \u0926\u093f\u0916\u093e\u0908 \u0926\u0947 \u0930\u0939\u0940 \u0939\u0948",
}


def _review_reasons_hi(reasons: list[str]) -> list[str]:
    return [_REVIEW_REASON_HI.get(r, r) for r in reasons]


# --------------------------------------------------------------------------- #
# Main entry point
# --------------------------------------------------------------------------- #

def grade_photo(image_bytes: bytes | None = None,
                context: dict | None = None,
                cv_report: dict | None = None) -> dict:
    """Return the marketplace grading report (exact output schema)."""
    context = context or {}

    crop_en = english_crop_name(context.get("crop_name", ""))
    crop_hi = hindi_crop_name(context.get("crop_name", ""))
    variety = (context.get("crop_variety") or "").strip()
    variety_en = f" {variety}" if variety else ""
    variety_hi = f" {variety}" if variety else ""
    farmer_grade = (context.get("farmer_grade") or "").strip().upper() or None
    location = (context.get("location") or "").strip()

    analysis = None
    if image_bytes:
        try:
            analysis = analyze_image(image_bytes)
        except Exception:
            analysis = None

    # Merge with externally supplied CV pre-analysis when we have no pixels
    external_cv = cv_report or {}
    if analysis is None and external_cv:
        analysis = {
            "brightness": float(external_cv.get("brightness", 128)),
            "blur_score": float(external_cv.get("blur_score", 50)),
            "color_uniformity": float(external_cv.get("color_uniformity", 60)),
            "quality": external_cv.get("quality", "fair"),
            "min_side": 1024,
            "luma_std": 30,
            "color_std": 30,
            "color_range": 60,
            "clip_hi": 0.0,
            "clip_lo": 0.0,
            "blemish_ratio": 0.10,
            "dark_ratio": 0.08,
            "soil_ratio": 0.10,
        }

    tips = [
        "Take photos in indirect natural daylight to highlight the true color.",
        "Spread produce on a clean tarp rather than the bare ground for better buyer trust.",
    ]

    # ---------------------------- NO EVIDENCE ---------------------------- #
    if analysis is None:
        return {
            "suggested_grade": "Needs review",
            "confidence_band": "Needs review",
            "confidence_score": 35,
            "quality_summary": "No usable photo was provided, so a visual grade could not be given.",
            "quality_summary_hi": "\u0915\u094b\u0908 \u0924\u0938\u094d\u0935\u0940\u0930 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940, \u0907\u0938\u0932\u0940 \u0917\u094d\u0930\u0947\u0921 \u0928\u0939\u0940\u0902 \u0926\u093f\u092f\u093e \u091c\u093e \u0938\u0915\u0924\u0947\u0964",
            "listing_description": "A clear harvest photo is required before this lot can be graded for buyers.",
            "listing_description_hi": "\u0916\u0930\u0940\u0926\u093e\u0930 \u0915\u094b \u0917\u094d\u0930\u0947\u0921 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0938\u093e\u092b\u093c \u0924\u0938\u094d\u0935\u0940\u0930 \u091a\u093e\u0939\u093f\u090f \u091c\u093c\u0930\u0942\u0930\u0940 \u0939\u0948\u0964",
            "quality_highlights": [],
            "caution_flags": [DISCLAIMER, "Upload at least one clear, well-lit photo of the harvested produce."],
            "visual_inspection": {
                "color_uniformity": "Low",
                "surface_blemishes": "Moderate",
                "apparent_freshness": "Good",
                "foreign_matter_or_dirt": "Moderate",
            },
            "farmer_tips": tips,
        }

    # --------------------------- PHOTO QUALITY --------------------------- #
    cv_quality = analysis["quality"]
    brightness = analysis["brightness"]
    blur_score = analysis["blur_score"]
    color_uniformity = analysis["color_uniformity"]
    blemish_ratio = analysis["blemish_ratio"]
    soil_ratio = analysis["soil_ratio"]
    dark_ratio = analysis["dark_ratio"]

    review_reasons = _photo_review_reasons(analysis)
    pixel_analysis_done = bool(image_bytes)

    blemish = _blemish_label(blemish_ratio)
    uniformity = _uniformity_label(color_uniformity)
    foreign = _foreign_matter_label(soil_ratio, dark_ratio)
    days = _days_since_harvest(context.get("harvest_date", ""))
    freshness = _freshness_label(days, analysis)

    uniformity_pct = int(round(color_uniformity))

    # --------------------------- SCORE + GRADE --------------------------- #
    sharp_component = blur_score
    brightness_component = float(np.clip(100.0 - abs(brightness - 140.0) * 0.65, 0, 100))
    blemish_component = float(np.clip(100.0 - blemish_ratio * 300.0, 0, 100))

    score = (0.34 * color_uniformity
             + 0.26 * blemish_component
             + 0.20 * sharp_component
             + 0.20 * brightness_component)

    if review_reasons:
        suggested_grade = "Needs review"
        confidence_band = "Needs review"
        confidence_score = int(np.clip(52 - 6 * len(review_reasons), 25, 55))
    else:
        if blemish == "Severe":
            suggested_grade = "C"
        elif score >= 84 and blemish in ("None", "Minor") and color_uniformity >= 76:
            suggested_grade = "A"
        elif score >= 62:
            suggested_grade = "B"
        else:
            suggested_grade = "C"

        confidence_score = 58
        if cv_quality == "good":
            confidence_score += 14
        elif cv_quality == "fair":
            confidence_score += 6
        if analysis["min_side"] >= 900:
            confidence_score += 4
        elif analysis["min_side"] >= 450:
            confidence_score += 2
        nearest = min(abs(score - 84), abs(score - 62))
        confidence_score += float(np.clip(nearest, 0, 10)) * 0.7
        if not pixel_analysis_done:
            confidence_score = min(confidence_score, 62)
        confidence_score = int(np.clip(confidence_score, 45, 95))
        confidence_band = "High" if confidence_score >= 78 else "Medium"

    # ------------------------------ TEXT (EN) ----------------------------- #
    if suggested_grade == "A":
        quality_summary = (f"Grade A{variety_en} {crop_en} with uniform color and size, "
                           f"a clean fresh surface and no significant visible defects.")
        listing_description = (f"Uniformly sized {crop_en} with even color and a clean, "
                               f"blemish-free surface from {location or 'the farm'}. "
                               f"Ideal for premium retail shelves and direct-to-buyer packs.")
    elif suggested_grade == "B":
        quality_summary = (f"Grade B{variety_en} {crop_en} of good commercial quality with "
                           f"minor cosmetic blemishes and slight size variation.")
        listing_description = (f"Good commercial grade {crop_en} with mostly uniform appearance "
                               f"and only minor surface marks. Well suited to wholesale markets, "
                               f"retail and routine processing.")
    elif suggested_grade == "C":
        quality_summary = (f"Grade C{variety_en} {crop_en} with visible surface defects and "
                           f"uneven color or size; priced for quick sale or processing.")
        listing_description = (f"{crop_en} lot with irregular sizing and visible bruising or "
                               f"discoloration. Best suited to rapid discount clearance or "
                               f"processing use rather than fresh retail display.")
    else:
        reason_text = ", ".join(review_reasons[:3]) if review_reasons else "photo quality"
        quality_summary = (f"The photo could not be graded reliably ({reason_text}); "
                           f"a clearer image of the produce is needed.")
        listing_description = ("This lot is awaiting a clearer harvest photo before a visual "
                               "grade and listing description can be issued.")

    if location:
        listing_description += f" Located in {location}."

    # ------------------------------ TEXT (HI) ----------------------------- #
    if suggested_grade == "A":
        quality_summary_hi = (f"\u0917\u094d\u0930\u0947\u0921 A{variety_hi} {crop_hi} \u092e\u0947\u0902 "
                              f"\u090f\u0915 \u091c\u0948\u0938\u093e \u0930\u0902\u0917 \u0914\u0930 \u0906\u0915\u093e\u0930, "
                              f"\u0938\u093e\u092b\u093c \u0924\u093e\u091c\u093c\u093e \u0938\u0924\u0939 \u0914\u0930 "
                              f"\u0915\u094b\u0908 \u092c\u0921\u093c\u0940 \u0926\u093e\u0917 \u0928\u0939\u0940\u0902\u0964")
        listing_description_hi = (f"\u090f\u0915 \u0938\u092e\u093e\u0928 \u0906\u0915\u093e\u0930 \u0914\u0930 \u0938\u093e\u092b\u093c\u0947 "
                                  f"\u0930\u0902\u0917 \u0935\u093e\u0932\u0947 {crop_hi}, \u0938\u0924\u0939 \u092a\u0930 \u0915\u094b\u0908 "
                                  f"\u0928\u093f\u0936\u093e\u0928 \u0928\u0939\u0940\u0902\u0964 "
                                  f"\u092a\u094d\u0930\u0940\u092e\u093f\u092f\u092e \u0930\u093f\u091f\u0947\u0932 \u0914\u0930 "
                                  f"\u0938\u0940\u0927 \u092c\u093f\u0915\u094d\u0930\u0940 \u0915\u0947 \u0932\u093f\u090f "
                                  f"\u090f\u0915\u0926\u092e \u0909\u092a\u092f\u0941\u0915\u094d\u0924\u0964")
    elif suggested_grade == "B":
        quality_summary_hi = (f"\u0917\u094d\u0930\u0947\u0921 B{variety_hi} {crop_hi} \u2014 "
                              f"\u0905\u091a\u094d\u091b\u0940 \u092c\u093e\u091c\u093c\u093e\u0930 \u0917\u0941\u0923\u0935\u0924\u094d\u0924\u093e "
                              f"\u0935\u093e\u0932\u093e\u0964 \u0939\u0932\u094d\u0915\u0947 \u0915\u0949\u0938\u094d\u092e\u0947\u091f\u093f\u0915 "
                              f"\u0926\u093e\u0917 \u0914\u0930 \u0925\u094b\u0921\u093c\u0940 \u0906\u0915\u093e\u0930 "
                              f"\u092d\u093f\u0928\u094d\u0928\u0924\u093e\u0964")
        listing_description_hi = (f"\u0905\u091a\u094d\u091b\u0940 \u0930\u0902\u0917 \u0914\u0930 \u0917\u093f\u0928\u0928\u0947 "
                                  f"\u0926\u093e\u0917\u094b\u0902 \u0935\u093e\u0932\u0947 {crop_hi}, \u0938\u0924\u0939 \u092a\u0930 "
                                  f"\u0938\u093f\u0930\u094d\u0924 \u0928\u093f\u0936\u093e\u0928 \u0926\u093f\u0916\u093e\u0908\u0964 "
                                  f"\u0925\u094b\u0915 \u092e\u0902\u0921\u0940, \u0930\u093f\u091f\u0947\u0932 \u0914\u0930 "
                                  f"\u092a\u094d\u0930\u094b\u0938\u0947\u0938\u093f\u0902\u0917 \u0915\u0947 \u0932\u093f\u090f "
                                  f"\u0905\u0928\u0941\u0915\u0942\u0932 \u0939\u0948\u0964")
    elif suggested_grade == "C":
        quality_summary_hi = (f"\u0917\u094d\u0930\u0947\u0921 C{variety_hi} {crop_hi} \u2014 \u0938\u0924\u0939 \u092a\u0930 "
                              f"\u0926\u093e\u0917\u0913\u0902 \u0914\u0930 \u0905\u0938\u092e\u093e\u0928 \u0906\u0915\u093e\u0930/"
                              f"\u0930\u0902\u0917; \u091c\u0932\u094d\u0926\u0940 \u092c\u093f\u0915\u094d\u0930\u0940 \u092f\u093e "
                              f"\u092a\u094d\u0930\u094b\u0938\u0947\u0938\u093f\u0902\u0917 \u0915\u0947 \u0932\u093f\u090f\u0964")
        listing_description_hi = (f"\u0905\u0938\u092e\u093e\u0928 \u0906\u0915\u093e\u0930 \u0914\u0930 \u091f\u0947\u092a\u0940/"
                                  f"\u092a\u0921\u093c\u0947 \u0915\u0947 \u0928\u093f\u0936\u093e\u0928 \u0935\u093e\u0932\u0947 "
                                  f"{crop_hi}\u0964 \u0924\u0941\u0930\u0902\u0924 \u091b\u0942\u091f \u092f\u093e "
                                  f"\u092a\u094d\u0930\u094b\u0938\u0947\u0938\u093f\u0902\u0917 \u0915\u0947 \u0932\u093f\u090f "
                                  f"\u0909\u092a\u092f\u0941\u0915\u094d\u0924\u0964")
    else:
        hi_reasons = _review_reasons_hi(review_reasons)
        reason_text = ", ".join(hi_reasons[:2]) if hi_reasons else (
            "\u092b\u094b\u091f\u094b \u0915\u0940 \u0917\u0941\u0923\u0935\u0924\u094d\u0924\u093e"
        )
        quality_summary_hi = (f"\u0924\u0938\u094d\u0935\u0940\u0930 \u0938\u0947 \u092d\u0930\u094b\u0938\u0947\u092e\u0902\u0926 "
                              f"\u0917\u094d\u0930\u0947\u0921 \u0928\u0939\u0940\u0902 \u0926\u093f\u092f\u093e \u091c\u093e "
                              f"\u0938\u0915\u0924\u093e ({reason_text}); \u0938\u093e\u092b\u093c \u0924\u0938\u094d\u0935\u0940\u0930 "
                              f"\u091a\u093e\u0939\u093f\u090f \u091c\u093c\u0930\u0942\u0930\u0940 \u0939\u0948\u0964")
        listing_description_hi = (f"\u092f\u0939 \u0932\u0949\u091f \u0938\u093e\u092b\u093c \u0924\u0938\u094d\u0935\u0940\u0930 "
                                  f"\u0915\u0947 \u0907\u0902\u0924\u091c\u093c \u0939\u094b\u0928\u0947 \u092a\u0930 "
                                  f"\u0939\u0948\u0964")

    # ---------------------------- HIGHLIGHTS ----------------------------- #
    highlights = []
    if color_uniformity >= 80:
        highlights.append(f"Highly uniform color across the lot (measured uniformity {uniformity_pct}%)")
    elif color_uniformity >= 60:
        highlights.append(f"Mostly consistent color (measured uniformity {uniformity_pct}%)")
    if blemish in ("None", "Minor"):
        highlights.append("Firm surface with no widespread bruising or dark spotting")
    if blur_score >= 45 and cv_quality == "good":
        highlights.append("Sharp, well-lit photo that clearly shows produce condition")
    if foreign == "Clean":
        highlights.append("Clean surface with no visible soil or foreign matter")
    if freshness == "Freshly Harvested":
        highlights.append("Recently harvested — appears fresh and well cured")
    elif freshness == "Good":
        highlights.append("Good apparent freshness for the time since harvest")
    if not highlights:
        highlights.append(f"Visual review completed with {uniformity.lower()} color uniformity")

    # ---------------------------- CAUTION FLAGS -------------------------- #
    cautions = [DISCLAIMER]
    if farmer_grade and farmer_grade[0] in "ABC" and suggested_grade in "ABC" \
            and farmer_grade[0] != suggested_grade:
        cautions.append(f"Farmer stated Grade {farmer_grade[0]}, but visual grading suggests "
                        f"Grade {suggested_grade}; grade shown is based only on photo evidence.")
    if blemish in ("Moderate", "Severe"):
        cautions.append("Visible surface blemishes/discoloration present; buyers should "
                        "inspect a sample before bulk purchase.")
    elif blemish == "Minor":
        cautions.append("Minor cosmetic marks visible on part of the lot.")
    if foreign == "Moderate":
        cautions.append("Some soil or dust residue visible; dry cleaning recommended before packing.")
    elif foreign == "High":
        cautions.append("Notable soil/dust or dark residue on the produce; thorough cleaning "
                        "required before retail packaging.")
    if uniformity == "Low":
        cautions.append("Noticeable size/color variation across the photographed sample.")
    if days is not None and days > 15:
        cautions.append(f"Harvested/stored about {days} days ago; confirm storage and "
                        f"sprouting status before purchase.")
    if cv_quality == "fair":
        cautions.append("Photo quality is average; grade confidence is limited — "
                        "a sharper photo would improve certainty.")
    if len(cautions) == 1:
        cautions.append("No significant visual cautions detected in this photo.")

    # ---------------------------- FARMER TIPS ---------------------------- #
    farmer_tips = []
    if blur_score < 45:
        farmer_tips.append("Hold the phone steady or use a timer to avoid blur; "
                           "focus on the produce before capturing.")
    if brightness < 110:
        farmer_tips.append("Shoot in brighter indirect daylight — the current photo is dark "
                           "and hides true color.")
    elif brightness > 200:
        farmer_tips.append("Avoid direct midday sun or flash; harsh light washes out color detail.")
    if foreign in ("Moderate", "High"):
        farmer_tips.append("Brush off soil and dry the produce before the photo and before packing.")
    if uniformity in ("Medium", "Low"):
        farmer_tips.append("Spread the lot in a single even layer so buyers can judge size uniformity.")
    farmer_tips.append("Include a coin or ruler next to one sample to show true size to distant buyers.")
    farmer_tips.append("Keep stored bags on wooden pallets away from ground moisture.")
    farmer_tips = farmer_tips[:4]

    return {
        "suggested_grade": suggested_grade,
        "confidence_band": confidence_band,
        "confidence_score": int(confidence_score),
        "quality_summary": quality_summary,
        "quality_summary_hi": quality_summary_hi,
        "listing_description": listing_description,
        "listing_description_hi": listing_description_hi,
        "quality_highlights": highlights[:4],
        "caution_flags": cautions[:5],
        "visual_inspection": {
            "color_uniformity": uniformity,
            "surface_blemishes": blemish,
            "apparent_freshness": freshness,
            "foreign_matter_or_dirt": foreign,
        },
        "farmer_tips": farmer_tips,
    }
