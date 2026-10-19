"""
AgriNova AI — Crop Recommendation Module
==========================================
Predicts the best crop to grow given soil & weather conditions, and gives
a fertilizer suggestion on top of it.

Two ways to run:
  1. Interactive (manual entry):
       python3 predict_crop.py
     -> prompts you for N, P, K, temperature, humidity, ph, rainfall

  2. Auto-fill demo mode (instant, no typing — good for live hackathon demo):
       python3 predict_crop.py --demo
     -> picks a random realistic sample and shows the prediction instantly

  3. Programmatic / from your web dashboard (import this module):
       from predict_crop import predict_crop
       result = predict_crop(N=90, P=40, K=40, temperature=24, humidity=80, ph=6.5, rainfall=200)
"""
import argparse
import os
import random
import joblib
import numpy as np
import pandas as pd

# Make sure fertilizer_advisor (same folder) is importable regardless of
# where this script is run/imported from
sys_path_dir = os.path.dirname(os.path.abspath(__file__))
import sys
if sys_path_dir not in sys.path:
    sys.path.append(sys_path_dir)

from fertilizer_advisor import recommend_fertilizer

# Resolve all data/model file paths relative to THIS file's location,
# not the current working directory — so this works whether you run
# `python predict_crop.py` from inside this folder, or import it from
# a backend/app.py sitting in a different folder entirely.
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_THIS_DIR, "crop_model.joblib")
ENCODER_PATH = os.path.join(_THIS_DIR, "label_encoder.joblib")
SCALER_PATH = os.path.join(_THIS_DIR, "feature_scaler.joblib")
DATA_PATH = os.path.join(_THIS_DIR, "Crop_recommendation.csv")

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
_training_data = pd.read_csv(DATA_PATH)
_TRAINING_RANGES = {
    feature: (float(_training_data[feature].min()), float(_training_data[feature].max()))
    for feature in FEATURES
}

_model = joblib.load(MODEL_PATH)
_encoder = joblib.load(ENCODER_PATH)
_scaler = joblib.load(SCALER_PATH)


def predict_crop(N, P, K, temperature, humidity, ph, rainfall, top_n=3):
    """
    Returns the top_n predicted crops with confidence scores, plus a
    fertilizer suggestion for the top prediction.
    """
    values = {"N": N, "P": P, "K": K, "temperature": temperature, "humidity": humidity, "ph": ph, "rainfall": rainfall}
    numeric_values = {}
    for feature, value in values.items():
        try:
            numeric_values[feature] = float(value)
        except (TypeError, ValueError):
            raise ValueError(f"{feature} must be a number.") from None
        if not np.isfinite(numeric_values[feature]):
            raise ValueError(f"{feature} must be a finite number.")
        minimum, maximum = _TRAINING_RANGES[feature]
        if not minimum <= numeric_values[feature] <= maximum:
            raise ValueError(
                f"The model has no training examples for {feature} in this range "
                f"({minimum:.2f}–{maximum:.2f}). No crop estimate was generated."
            )

    input_df = pd.DataFrame([[numeric_values[feature] for feature in FEATURES]], columns=FEATURES)
    input_scaled = _scaler.transform(input_df)

    probs = _model.predict_proba(input_scaled)[0]
    top_indices = np.argsort(probs)[::-1][:top_n]

    top_predictions = [
        {"crop": _encoder.inverse_transform([idx])[0], "confidence": round(probs[idx] * 100, 2)}
        for idx in top_indices
    ]

    best_crop = top_predictions[0]["crop"]
    fertilizer_info = recommend_fertilizer({"N": numeric_values["N"], "P": numeric_values["P"], "K": numeric_values["K"]}, best_crop, dataset_path=DATA_PATH)

    return {
        "input": {
            **numeric_values
        },
        "top_predictions": top_predictions,
        "recommended_crop": best_crop,
        "confidence": top_predictions[0]["confidence"],
        "fertilizer_advice": fertilizer_info
    }


def print_result(result):
    print("\n" + "=" * 55)
    print("  AgriNova AI — Crop Recommendation Result")
    print("=" * 55)
    print(f"\nInput conditions:")
    for k, v in result["input"].items():
        print(f"   {k:12s}: {v}")

    print(f"\nTop {len(result['top_predictions'])} recommended crops:")
    for i, pred in enumerate(result["top_predictions"], 1):
        marker = "  <-- BEST MATCH" if i == 1 else ""
        print(f"   {i}. {pred['crop']:15s} ({pred['confidence']}% confidence){marker}")

    fert = result["fertilizer_advice"]
    print(f"\nFertilizer advice for {fert['crop']}:")
    print(f"   Ideal N-P-K for this crop : N={fert['ideal_npk']['N']}, P={fert['ideal_npk']['P']}, K={fert['ideal_npk']['K']}")
    print(f"   Your soil N-P-K           : N={fert['user_npk']['N']}, P={fert['user_npk']['P']}, K={fert['user_npk']['K']}")
    for s in fert["suggestions"]:
        print(f"   - {s}")
    print("=" * 55 + "\n")


def get_manual_input():
    print("Enter soil and weather conditions:\n")
    N = float(input("Nitrogen (N) content in soil (kg/ha)         : "))
    P = float(input("Phosphorus (P) content in soil (kg/ha)       : "))
    K = float(input("Potassium (K) content in soil (kg/ha)        : "))
    temperature = float(input("Temperature (°C)                            : "))
    humidity = float(input("Relative humidity (%)                       : "))
    ph = float(input("Soil pH (0-14)                              : "))
    rainfall = float(input("Rainfall (mm)                               : "))
    return dict(N=N, P=P, K=K, temperature=temperature, humidity=humidity, ph=ph, rainfall=rainfall)


def get_autofill_input():
    """Picks a random real sample from the dataset for instant demo purposes."""
    df = pd.read_csv(DATA_PATH)
    sample = df.sample(1).iloc[0]
    print(f"[DEMO MODE] Auto-filled sample (true label was: '{sample['label']}' — let's see if the model agrees)\n")
    return dict(
        N=sample["N"], P=sample["P"], K=sample["K"],
        temperature=sample["temperature"], humidity=sample["humidity"],
        ph=sample["ph"], rainfall=sample["rainfall"]
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriNova AI Crop Recommendation")
    parser.add_argument("--demo", action="store_true", help="Auto-fill a random realistic sample instead of manual entry")
    args = parser.parse_args()

    if args.demo:
        inputs = get_autofill_input()
    else:
        inputs = get_manual_input()

    result = predict_crop(**inputs)
    print_result(result)
