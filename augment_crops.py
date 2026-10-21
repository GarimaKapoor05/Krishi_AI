import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

np.random.seed(42)

DIR = Path("Backend/crop_recommendation")
csv_path = DIR / "Crop_recommendation.csv"

df = pd.read_csv(csv_path)
existing_labels = set(df["label"].unique())
print(f"Existing labels ({len(existing_labels)}): {existing_labels}")

# Define vegetable distributions
VEGETABLES = {
    "tomato": {
        "N": (110, 10, 75, 140), "P": (65, 8, 40, 90), "K": (60, 7, 35, 80),
        "temperature": (24.5, 2.5, 18, 31), "humidity": (65, 5, 50, 80),
        "ph": (6.5, 0.28, 5.7, 7.3), "rainfall": (82, 12, 50, 120)
    },
    "potato": {
        "N": (98, 9, 70, 125), "P": (55, 7, 35, 75), "K": (112, 12, 80, 145),
        "temperature": (18.5, 2.0, 13, 24), "humidity": (72, 4.5, 58, 85),
        "ph": (5.8, 0.30, 4.9, 6.7), "rainfall": (68, 9, 40, 95)
    },
    "onion": {
        "N": (75, 8, 50, 95), "P": (48, 6, 30, 65), "K": (50, 6, 30, 70),
        "temperature": (23.5, 2.8, 16, 31), "humidity": (62, 5, 48, 76),
        "ph": (6.7, 0.25, 6.0, 7.5), "rainfall": (62, 8, 38, 88)
    },
    "chilli": {
        "N": (90, 9, 65, 115), "P": (55, 6, 35, 75), "K": (55, 6, 35, 75),
        "temperature": (26.5, 2.5, 20, 33), "humidity": (66, 5, 52, 80),
        "ph": (6.4, 0.28, 5.6, 7.2), "rainfall": (88, 12, 55, 130)
    },
    "brinjal": {
        "N": (102, 10, 75, 130), "P": (56, 7, 35, 75), "K": (54, 6, 35, 72),
        "temperature": (27.0, 2.4, 21, 33), "humidity": (72, 4.5, 58, 84),
        "ph": (6.3, 0.28, 5.5, 7.1), "rainfall": (92, 12, 58, 135)
    },
    "cabbage": {
        "N": (94, 9, 70, 120), "P": (48, 6, 30, 65), "K": (48, 6, 30, 65),
        "temperature": (18.0, 2.0, 13, 23), "humidity": (76, 4.5, 62, 88),
        "ph": (6.6, 0.25, 5.8, 7.4), "rainfall": (72, 9, 45, 100)
    },
    "cauliflower": {
        "N": (98, 9, 72, 122), "P": (52, 6, 32, 70), "K": (52, 6, 32, 70),
        "temperature": (18.8, 1.8, 14, 24), "humidity": (73, 4.5, 60, 85),
        "ph": (6.5, 0.25, 5.7, 7.3), "rainfall": (68, 9, 42, 95)
    }
}

new_rows = []
for crop, params in VEGETABLES.items():
    if crop in existing_labels:
        print(f"Skipping {crop}, already exists")
        continue
    N_SAMPLES = 100
    crop_data = {}
    for feat in ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]:
        mean, std, v_min, v_max = params[feat]
        vals = np.clip(np.random.normal(mean, std, N_SAMPLES), v_min, v_max)
        if feat in ["N", "P", "K"]:
            crop_data[feat] = np.round(vals).astype(int)
        elif feat == "ph":
            crop_data[feat] = np.round(vals, 2)
        else:
            crop_data[feat] = np.round(vals, 4)
    crop_data["label"] = [crop] * N_SAMPLES
    new_rows.append(pd.DataFrame(crop_data))

if new_rows:
    augmented_df = pd.concat([df] + new_rows, ignore_index=True)
    augmented_df.to_csv(csv_path, index=False)
    print(f"Saved augmented dataset with {len(augmented_df)} rows and {augmented_df['label'].nunique()} classes to {csv_path}")
else:
    augmented_df = df

# Retrain model
FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
X = augmented_df[FEATURES]
y = augmented_df["label"]

le = LabelEncoder()
y_enc = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = RandomForestClassifier(
    n_estimators=250,
    max_depth=None,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train_scaled, y_train)

y_pred = model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred, target_names=le.classes_)

print(f"Test Accuracy: {acc*100:.2f}%")

joblib.dump(model, DIR / "crop_model.joblib")
joblib.dump(le, DIR / "label_encoder.joblib")
joblib.dump(scaler, DIR / "feature_scaler.joblib")

with open(DIR / "model_report.txt", "w", encoding="utf-8") as f:
    f.write(f"Crop Recommendation Model - Random Forest Classifier (Augmented 29 Crops)\n")
    f.write(f"Test Accuracy: {acc*100:.2f}%\n\n")
    f.write("Classification Report:\n")
    f.write(report)

print("Saved crop_model.joblib, label_encoder.joblib, feature_scaler.joblib, and model_report.txt successfully!")
