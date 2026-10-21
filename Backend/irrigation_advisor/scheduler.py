"""Transparent, provisional crop-water balance for the irrigation advisor.

The crop coefficients and root/depletion parameters are generalized FAO-56
planning values. Soil available-water defaults are broad texture-class
benchmarks, not measurements of an individual field.
"""

from datetime import date, datetime
import math
from zoneinfo import ZoneInfo


# Typical cycle durations are only used to place a crop on a generalized
# four-stage curve. Local variety and planting conditions can change these.
CROPS = {
    # Cereals
    "wheat":       {"days": 125, "kc": (0.30, 1.15, 0.25), "root": 1.0, "p": 0.55},
    "rice":        {"days": 140, "kc": (1.05, 1.20, 0.90), "root": 0.6, "p": 0.20},
    "paddy":       {"days": 140, "kc": (1.05, 1.20, 0.90), "root": 0.6, "p": 0.20},
    "maize":       {"days": 110, "kc": (0.30, 1.20, 0.60), "root": 1.0, "p": 0.55},
    "corn":        {"days": 110, "kc": (0.30, 1.20, 0.60), "root": 1.0, "p": 0.55},
    "millet":      {"days": 90,  "kc": (0.30, 1.00, 0.30), "root": 1.0, "p": 0.55},
    "bajra":       {"days": 90,  "kc": (0.30, 1.00, 0.30), "root": 1.0, "p": 0.55},
    "sorghum":     {"days": 115, "kc": (0.30, 1.10, 0.55), "root": 1.0, "p": 0.55},
    "jowar":       {"days": 115, "kc": (0.30, 1.10, 0.55), "root": 1.0, "p": 0.55},
    "barley":      {"days": 115, "kc": (0.30, 1.15, 0.25), "root": 1.0, "p": 0.55},

    # Pulses and oilseeds
    "chickpea":    {"days": 100, "kc": (0.40, 1.00, 0.35), "root": 0.8, "p": 0.50},
    "gram":        {"days": 100, "kc": (0.40, 1.00, 0.35), "root": 0.8, "p": 0.50},
    "soybean":     {"days": 110, "kc": (0.40, 1.15, 0.50), "root": 0.8, "p": 0.50},
    "groundnut":   {"days": 120, "kc": (0.40, 1.15, 0.60), "root": 0.8, "p": 0.50},
    "peanut":      {"days": 120, "kc": (0.40, 1.15, 0.60), "root": 0.8, "p": 0.50},
    "mustard":     {"days": 125, "kc": (0.35, 1.10, 0.35), "root": 1.0, "p": 0.60},
    "rapeseed":    {"days": 125, "kc": (0.35, 1.10, 0.35), "root": 1.0, "p": 0.60},
    "lentil":      {"days": 110, "kc": (0.40, 1.10, 0.40), "root": 0.8, "p": 0.50},
    "blackgram":   {"days": 85,  "kc": (0.40, 1.05, 0.45), "root": 0.7, "p": 0.50},
    "mungbean":    {"days": 75,  "kc": (0.40, 1.05, 0.45), "root": 0.7, "p": 0.50},
    "moong":       {"days": 75,  "kc": (0.40, 1.05, 0.45), "root": 0.7, "p": 0.50},
    "mothbeans":   {"days": 80,  "kc": (0.35, 1.00, 0.40), "root": 0.7, "p": 0.55},
    "pigeonpeas":  {"days": 180, "kc": (0.40, 1.10, 0.45), "root": 1.2, "p": 0.50},
    "arhar":       {"days": 180, "kc": (0.40, 1.10, 0.45), "root": 1.2, "p": 0.50},
    "tur":         {"days": 180, "kc": (0.40, 1.10, 0.45), "root": 1.2, "p": 0.50},
    "kidneybeans": {"days": 95,  "kc": (0.40, 1.15, 0.45), "root": 0.8, "p": 0.45},
    "rajma":       {"days": 95,  "kc": (0.40, 1.15, 0.45), "root": 0.8, "p": 0.45},

    # Vegetables
    "tomato":      {"days": 135, "kc": (0.60, 1.15, 0.80), "root": 0.8, "p": 0.40},
    "potato":      {"days": 110, "kc": (0.50, 1.15, 0.75), "root": 0.6, "p": 0.35},
    "onion":       {"days": 130, "kc": (0.70, 1.05, 0.75), "root": 0.4, "p": 0.30},
    "chili":       {"days": 150, "kc": (0.60, 1.05, 0.80), "root": 0.8, "p": 0.40},
    "chilli":      {"days": 150, "kc": (0.60, 1.05, 0.80), "root": 0.8, "p": 0.40},
    "pepper":      {"days": 150, "kc": (0.60, 1.05, 0.80), "root": 0.8, "p": 0.40},
    "cabbage":     {"days": 110, "kc": (0.45, 1.05, 0.90), "root": 0.6, "p": 0.45},
    "cauliflower": {"days": 105, "kc": (0.45, 1.05, 0.90), "root": 0.6, "p": 0.45},
    "brinjal":     {"days": 130, "kc": (0.60, 1.05, 0.85), "root": 0.8, "p": 0.45},
    "eggplant":    {"days": 130, "kc": (0.60, 1.05, 0.85), "root": 0.8, "p": 0.45},
    "okra":        {"days": 90,  "kc": (0.40, 1.00, 0.75), "root": 0.7, "p": 0.50},
    "bhindi":      {"days": 90,  "kc": (0.40, 1.00, 0.75), "root": 0.7, "p": 0.50},
    "garlic":      {"days": 130, "kc": (0.70, 1.00, 0.70), "root": 0.4, "p": 0.30},

    # Fruits & Plantation (including Papaya, Melons, Tree Fruits)
    "papaya":      {"days": 365, "kc": (0.50, 1.05, 0.85), "root": 0.9, "p": 0.40},
    "watermelon":  {"days": 90,  "kc": (0.40, 1.00, 0.75), "root": 0.8, "p": 0.45},
    "muskmelon":   {"days": 90,  "kc": (0.45, 1.05, 0.75), "root": 0.8, "p": 0.45},
    "banana":      {"days": 365, "kc": (0.50, 1.10, 1.00), "root": 0.8, "p": 0.35},
    "mango":       {"days": 365, "kc": (0.60, 0.85, 0.75), "root": 1.4, "p": 0.50},
    "orange":      {"days": 365, "kc": (0.65, 0.75, 0.70), "root": 1.2, "p": 0.50},
    "apple":       {"days": 240, "kc": (0.50, 0.95, 0.75), "root": 1.2, "p": 0.50},
    "grapes":      {"days": 210, "kc": (0.35, 0.85, 0.60), "root": 1.2, "p": 0.45},
    "pomegranate": {"days": 365, "kc": (0.50, 0.80, 0.65), "root": 1.2, "p": 0.50},
    "coconut":     {"days": 365, "kc": (0.70, 0.80, 0.75), "root": 1.5, "p": 0.50},

    # Commercial & Fiber
    "cotton":      {"days": 165, "kc": (0.35, 1.15, 0.70), "root": 1.2, "p": 0.65},
    "sugarcane":   {"days": 365, "kc": (0.40, 1.25, 0.75), "root": 1.2, "p": 0.65},
    "jute":        {"days": 120, "kc": (0.45, 1.10, 0.65), "root": 0.8, "p": 0.50},
    "coffee":      {"days": 365, "kc": (0.60, 0.95, 0.75), "root": 1.2, "p": 0.50},
}

# Approximate available water (mm per metre of soil). A field soil test or
# measured field capacity/wilting point should replace these broad defaults.
SOIL_AWC = {
    "alluvial": 140,
    "black": 160,
    "red_yellow": 110,
    "laterite": 100,
    "arid_sandy": 80,
    "loamy_clay": 150,
    "unknown": 120,
}

STAGE_LABELS = ("Initial", "Crop development", "Mid-season", "Late season")


def _crop_parameters(name):
    key = "".join(char for char in (name or "").lower() if char.isalpha())
    if not key:
        return {"days": 120, "kc": (0.40, 1.10, 0.60), "root": 0.8, "p": 0.50}, False
    for alias, values in CROPS.items():
        if key == alias or key.startswith(alias) or alias.startswith(key):
            return values, True
    return {"days": 120, "kc": (0.40, 1.10, 0.60), "root": 0.8, "p": 0.50}, False


def _stage(age, duration):
    # FAO crop-coefficient curves use initial, development, mid-season and
    # late-season periods; these default shares are generalized calendar bands.
    progress = min(max(age / max(duration, 1), 0), 1)
    if progress < 0.15:
        return 0, progress / 0.15
    if progress < 0.40:
        return 1, (progress - 0.15) / 0.25
    if progress < 0.80:
        return 2, (progress - 0.40) / 0.40
    return 3, (progress - 0.80) / 0.20


def _kc_at(age, crop):
    index, fraction = _stage(age, crop["days"])
    initial, middle, ending = crop["kc"]
    if index == 0:
        return initial, STAGE_LABELS[index]
    if index == 1:
        return initial + (middle - initial) * fraction, STAGE_LABELS[index]
    if index == 2:
        return middle, STAGE_LABELS[index]
    return middle + (ending - middle) * fraction, STAGE_LABELS[index]


def _profile_stage(stage_id, crop):
    initial, middle, ending = crop["kc"]
    stages = {
        "germination": (initial, "Germination / emergence", 0.15),
        "vegetative": ((initial + middle) / 2, "Vegetative growth", 0.40),
        "flowering": (middle, "Flowering", 0.70),
        "fruiting": (middle, "Fruiting / grain formation", 0.80),
        "ripening": (ending, "Ripening / maturity", 0.90),
        "harvest": (ending, "Harvest ready", 1.0),
    }
    return stages.get(stage_id)


def calculate_schedule(payload):
    """Return a seven-day root-zone water balance, or raise ValueError."""
    crop_name = str(payload.get("crop") or "").strip()
    sowing_text = str(payload.get("sowing_date") or "").strip()
    field_condition = str(payload.get("field_condition") or "").lower()
    soil_type = str(payload.get("soil_type") or "unknown").lower()
    forecast = payload.get("forecast")
    if not crop_name:
        raise ValueError("Choose the crop in your farm profile before creating an irrigation plan.")
    try:
        sowing_date = date.fromisoformat(sowing_text)
    except (TypeError, ValueError):
        raise ValueError("Add the crop planting date in your farm profile to estimate its current stage.")
    today = datetime.now(ZoneInfo("Asia/Kolkata")).date()
    if sowing_date > today:
        raise ValueError("This crop has not been planted yet. Start irrigation planning after the sowing date.")
    if field_condition not in {"wet", "moist", "dry"}:
        raise ValueError("Select whether the crop root zone currently looks wet, moist, or dry.")
    if not isinstance(forecast, list) or not forecast:
        raise ValueError("A local seven-day weather forecast is needed for this estimate.")
    if len(forecast) < 7:
        raise ValueError("A complete seven-day local forecast is needed for this estimate. Refresh weather and try again.")

    crop, crop_supported = _crop_parameters(crop_name)
    age_days = (today - sowing_date).days
    if age_days >= crop["days"]:
        # If crop duration is reached, evaluate in late-season/mature stage
        age_days = max(0, crop["days"] - 1)

    soil_awc = SOIL_AWC.get(soil_type, SOIL_AWC["unknown"])
    max_root = crop["root"]
    profile_stage = _profile_stage(str(payload.get("crop_stage") or "").lower(), crop)
    root_progress = max(0, age_days) / max(crop["days"] * 0.45, 1)
    if profile_stage:
        root_progress = max(root_progress, profile_stage[2])
    root_depth = min(max_root, 0.15 + root_progress * (max_root - 0.15))
    taw = max(1, soil_awc * root_depth)
    depletion_fraction = {"wet": 0.15, "moist": 0.45, "dry": 0.80}[field_condition]
    depletion = taw * depletion_fraction

    try:
        area_ha = float(payload.get("area_ha")) if payload.get("area_ha") not in (None, "") else None
        if area_ha is not None and (not math.isfinite(area_ha) or area_ha <= 0):
            area_ha = None
    except (TypeError, ValueError):
        area_ha = None

    daily = []
    total_etc = 0.0
    effective_rain_total = 0.0
    trigger = None
    current_kc, current_stage = _kc_at(age_days, crop)
    if profile_stage:
        current_kc, current_stage = profile_stage[0], profile_stage[1]
    for day_index, item in enumerate(forecast[:7]):
        try:
            day = date.fromisoformat(str(item.get("date", "")))
            eto = max(0.0, float(item.get("et0_mm")))
            rainfall = max(0.0, float(item.get("rainfall_mm")))
        except (TypeError, ValueError):
            continue
        crop_age = age_days + max((day - today).days, 0)
        kc, stage = _kc_at(crop_age, crop)
        if day_index == 0 and profile_stage:
            kc, stage = profile_stage[0], profile_stage[1]
        etc = eto * kc
        # 80% is a coarse forecast-effective-rain assumption, capped to
        # today's ET plus available bucket capacity to avoid counting runoff.
        effective_rain = min(rainfall * 0.80, depletion + etc)
        depletion = min(taw, max(0.0, depletion + etc - effective_rain))
        # Adjust FAO's tabulated depletion fraction for this day's ETc.
        p = min(0.8, max(0.1, crop["p"] + 0.04 * (5 - etc)))
        raw = p * taw
        total_etc += etc
        effective_rain_total += effective_rain
        recommended = None
        if trigger is None and depletion >= raw:
            recommended = round(max(0.0, depletion - 0.10 * taw), 1)
            trigger = {"date": day.isoformat(), "depth_mm": recommended, "stage": stage}
            # For the forward schedule, assume the estimated net root-zone
            # replenishment is applied on the trigger day.
            depletion = max(0.0, depletion - recommended)
        daily.append({
            "date": day.isoformat(),
            "stage": stage,
            "kc": round(kc, 2),
            "eto_mm": round(eto, 1),
            "etc_mm": round(etc, 1),
            "rainfall_mm": round(rainfall, 1),
            "effective_rain_mm": round(effective_rain, 1),
            "root_zone_depletion_mm": round(depletion, 1),
            "trigger": recommended is not None,
        })

    if len(daily) < min(7, len(forecast)):
        raise ValueError("The seven-day forecast is missing ET₀ or rainfall data for one or more days. Refresh local weather and try again.")

    volume_m3 = round(trigger["depth_mm"] * area_ha * 10, 1) if trigger and area_ha else None
    if trigger:
        recommendation = "Irrigation likely needed today" if trigger["date"] == today.isoformat() else f"Plan to irrigate around {trigger['date']}"
        urgency = "High" if trigger["date"] == today.isoformat() and field_condition == "dry" else "Medium"
    else:
        recommendation = "No irrigation trigger expected in the next 7 days"
        urgency = "Low"

    return {
        "status": "success",
        "recommendation": recommendation,
        "urgency": urgency,
        "water_amount_mm": trigger["depth_mm"] if trigger else 0,
        "trigger_date": trigger["date"] if trigger else None,
        "current_stage": current_stage,
        "crop_age_days": age_days,
        "kc_today": round(current_kc, 2),
        "root_depth_m": round(root_depth, 2),
        "soil_awc_mm_m": soil_awc,
        "total_available_water_mm": round(taw, 1),
        "crop_water_demand_7d_mm": round(total_etc, 1),
        "effective_rainfall_7d_mm": round(effective_rain_total, 1),
        "water_volume_m3": volume_m3,
        "area_ha": area_ha,
        "crop_model": "FAO-56 generalized crop coefficients" if crop_supported else "Generic crop coefficient; crop-specific values unavailable",
        "daily": daily,
        "advice": "Planning estimate from reference ET₀, generalized crop stage, a broad soil-water class, field wetness and forecast rainfall. Check the root zone before applying water; actual soil capacity, variety, irrigation efficiency and rainfall infiltration vary by field.",
    }
