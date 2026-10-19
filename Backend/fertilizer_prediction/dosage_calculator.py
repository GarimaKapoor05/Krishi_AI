"""
Fertilizer Dosage Calculator
==============================
Given a nutrient deficiency (kg/ha gap) and the farmer's actual land area,
calculates how many KG of a specific fertilizer product to apply.

This is intentionally rule-based / formula-driven, not ML — real-world
fertilizer dosage is a standard agronomic calculation:

    kg of fertilizer needed = (nutrient gap in kg/ha x land area in ha) / (nutrient % content of that fertilizer)

Each fertilizer product has a known nutrient content percentage (this is
printed on every fertilizer bag in India, e.g. Urea = 46% N).
"""

# Nutrient content % for common fertilizers (standard, printed on packaging)
FERTILIZER_NUTRIENT_CONTENT = {
    "Urea": {"N": 0.46, "P": 0.0, "K": 0.0},
    "DAP (Di-Ammonium Phosphate)": {"N": 0.18, "P": 0.46, "K": 0.0},
    "MOP (Muriate of Potash)": {"N": 0.0, "P": 0.0, "K": 0.60},
    "NPK Complex Fertilizer (e.g. 19:19:19)": {"N": 0.19, "P": 0.19, "K": 0.19},
}

# Organic alternatives — approximate nutrient content (varies more in practice,
# these are standard reference averages used in Indian agri-extension material)
ORGANIC_NUTRIENT_CONTENT = {
    "Vermicompost / Farmyard Manure (FYM)": {"N": 0.015, "P": 0.005, "K": 0.01},
    "Bone Meal / Rock Phosphate": {"N": 0.02, "P": 0.20, "K": 0.0},
    "Wood Ash / Banana Peel Compost": {"N": 0.0, "P": 0.01, "K": 0.06},
    "Compost + FYM + Biofertilizer": {"N": 0.01, "P": 0.005, "K": 0.01},
}


def calculate_dosage(nutrient_gap, land_area_ha, fertilizer_name, use_organic=False):

    content_map = ORGANIC_NUTRIENT_CONTENT if use_organic else FERTILIZER_NUTRIENT_CONTENT
    if fertilizer_name not in content_map:
        return {"error": f"Unknown fertilizer '{fertilizer_name}'. Available: {list(content_map.keys())}"}

    nutrient_content = content_map[fertilizer_name]
    breakdown = {}
    #FIX 2: Only calculate for nutrients that this fertilizer actually contains
    for nutrient, gap_per_ha in nutrient_gap.items():
        if gap_per_ha <= 0:
            continue
        content_pct = nutrient_content.get(nutrient, 0)
        if content_pct == 0:
            continue
        kg_needed = (gap_per_ha * land_area_ha) / content_pct
        breakdown[nutrient] = round(kg_needed, 2)

# Use the PRIMARY nutrient's requirement only.
# Primary = nutrient where this fertilizer has its highest content %.
# e.g. DAP's primary nutrient is P (46%), not N (18%).
# This prevents N-gap from inflating DAP quantity.
    if breakdown:
        primary_nutrient = max(
            (n for n in breakdown if nutrient_content.get(n, 0) > 0),
            key=lambda n: nutrient_content.get(n, 0)
        )
        max_kg_needed = breakdown[primary_nutrient]

    if not breakdown:
        return {
            "fertilizer": fertilizer_name,
            "land_area_ha": land_area_ha,
            "total_kg_needed": 0,
            "breakdown": {},
            "note": "No deficiency requiring this fertilizer, or this fertilizer doesn't address the deficient nutrient(s)."
        }

    # When a single fertilizer supplies the deficient nutrient (most common case,
    # e.g. Urea for N-only deficiency), total = that nutrient's requirement.
    # For combination labels (e.g. "Urea + DAP"), this function is meant to be
    # called once per individual product in the combo (see get_dosage_plan below).
    total_kg = max_kg_needed

    return {
        "fertilizer": fertilizer_name,
        "land_area_ha": land_area_ha,
        "total_kg_needed": round(total_kg, 2),
        "breakdown_by_nutrient_kg": breakdown
    }


def get_dosage_plan(nutrient_gap, land_area_ha, fertilizer_label, use_organic=False):
    """
    Handles combination fertilizer labels like "Urea + DAP combination" by
    splitting them into individual product calculations.

    fertilizer_label: the raw recommendation string, e.g.
        "Urea", "Urea + DAP combination", "NPK Complex Fertilizer (e.g. 19:19:19)"

    Returns a list of dosage results, one per product needed.
    """
    # crude split for our known combination labels
    combo_map = {
        "Urea + DAP combination": ["Urea", "DAP (Di-Ammonium Phosphate)"],
        "Urea + MOP combination": ["Urea", "MOP (Muriate of Potash)"],
        "DAP + MOP combination": ["DAP (Di-Ammonium Phosphate)", "MOP (Muriate of Potash)"],
        "FYM + Bone Meal": ["Vermicompost / Farmyard Manure (FYM)", "Bone Meal / Rock Phosphate"],
        "FYM + Wood Ash": ["Vermicompost / Farmyard Manure (FYM)", "Wood Ash / Banana Peel Compost"],
        "Bone Meal + Wood Ash": ["Bone Meal / Rock Phosphate", "Wood Ash / Banana Peel Compost"],
    }

    products = combo_map.get(fertilizer_label, [fertilizer_label])
    results = []
    for product in products:
        is_organic = product in ORGANIC_NUTRIENT_CONTENT
        result = calculate_dosage(nutrient_gap, land_area_ha, product, use_organic=is_organic)
        results.append(result)
    return results


if __name__ == "__main__":
    # quick standalone test: rice field, 2 hectares, deficient in N by 25 kg/ha
    test_gap = {"N": 25, "P": 0, "K": 0}
    plan = get_dosage_plan(test_gap, land_area_ha=2, fertilizer_label="Urea")
    import json
    print(json.dumps(plan, indent=2))

    print("\n--- Combo example ---")
    test_gap2 = {"N": 20, "P": 15, "K": 0}
    plan2 = get_dosage_plan(test_gap2, land_area_ha=1.5, fertilizer_label="Urea + DAP combination")
    print(json.dumps(plan2, indent=2))
