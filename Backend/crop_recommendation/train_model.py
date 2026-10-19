"""
Trains a crop recommendation model on the Crop_recommendation.csv dataset.
Features: N, P, K, temperature, humidity, ph, rainfall
Target: crop label (22 classes)

Saves:
  - crop_model.joblib       (trained RandomForestClassifier)
  - label_encoder.joblib    (encodes/decodes crop name <-> integer)
  - feature_scaler.joblib   (StandardScaler fit on training features)
  - model_report.txt        (accuracy + classification report, for your slide/demo)
"""
from pathlib import Path

import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

MODULE_DIR = Path(__file__).resolve().parent
DATA_PATH = MODULE_DIR / "Crop_recommendation.csv"
df = pd.read_csv(DATA_PATH)

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
X = df[FEATURES]
y = df["label"]
if X.isnull().any().any() or y.isnull().any():
    raise ValueError("Training data contains missing feature values or crop labels.")

le = LabelEncoder()
y_enc = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train_scaled, y_train)

y_pred = model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred, target_names=le.classes_)

print(f"Test Accuracy: {acc*100:.2f}%\n")
print(report)

# Feature importance — useful for your pitch ("what drives the recommendation")
importances = pd.Series(model.feature_importances_, index=FEATURES).sort_values(ascending=False)
print("Feature importances:\n", importances)

with open(MODULE_DIR / "model_report.txt", "w", encoding="utf-8") as f:
    f.write(f"Crop Recommendation Model — Random Forest Classifier\n")
    f.write(f"Test Accuracy: {acc*100:.2f}%\n\n")
    f.write("Classification Report:\n")
    f.write(report)
    f.write("\nFeature Importances:\n")
    f.write(importances.to_string())

joblib.dump(model, MODULE_DIR / "crop_model.joblib")
joblib.dump(le, MODULE_DIR / "label_encoder.joblib")
joblib.dump(scaler, MODULE_DIR / "feature_scaler.joblib")

print("\nSaved: crop_model.joblib, label_encoder.joblib, feature_scaler.joblib, model_report.txt")
