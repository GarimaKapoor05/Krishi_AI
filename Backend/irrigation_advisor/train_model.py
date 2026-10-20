from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

MODULE_DIR = Path(__file__).resolve().parent

def train_model():
    csv_path = MODULE_DIR / "irrigation_data.csv"
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} samples from {csv_path.name}")
    
    X = df[['moisture', 'humidity', 'temp', 'et']]
    y = df['irrigate']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    model = RandomForestClassifier(n_estimators=150, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    model_dir = MODULE_DIR / "model"
    model_dir.mkdir(exist_ok=True)
    joblib.dump(model, model_dir / "irrigation_model.joblib")
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    
    print(f"Training Complete! Accuracy: {accuracy:.1%}")
    print(report)
    
    with open(MODULE_DIR / "model_report.txt", "w", encoding="utf-8") as f:
        f.write(f"Smart Irrigation Model Report (Agrometeorological Dataset)\n")
        f.write(f"Samples: {len(df)}\n")
        f.write(f"Accuracy: {accuracy:.1%}\n\n")
        f.write("Classification Report:\n")
        f.write(report)

if __name__ == "__main__":
    train_model()
