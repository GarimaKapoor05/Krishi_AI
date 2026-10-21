from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
model = None
model_path = os.path.join(_THIS_DIR, 'model', 'irrigation_model.joblib')

try:
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print("Irrigation ML Model loaded successfully")
except Exception as e:
    print(f"Using rule-based system: {e}")

@app.route('/predict', methods=['POST'])
def predict_irrigation():
    try:
        data = request.get_json(force=True)
        
        moisture = float(data.get('moisture', 40))
        humidity = float(data.get('humidity', 50))
        temp = float(data.get('temp', 28))
        et = float(data.get('et', 4.5))

        if model:
            features = np.array([[moisture, humidity, temp, et]])
            prediction = int(model.predict(features)[0])
        else:
            # Advanced rule-based logic
            prediction = 1 if moisture < 40 or (temp > 30 and humidity < 55) else 0

        # Rich recommendation logic
        water_need = max(0, int((60 - moisture) * 1.5))
        
        if prediction == 1:
            recommendation = "Irrigate Now"
            advice = f"Apply approximately {water_need} mm of water. Soil is dry."
            urgency = "High" if moisture < 25 else "Medium"
        else:
            recommendation = "No Irrigation Needed"
            advice = "Soil moisture is adequate. Monitor again in 24 hours."
            urgency = "Low"

        # Additional insights
        insights = []
        if temp > 32:
            insights.append("High temperature detected - increased evaporation")
        if humidity < 40:
            insights.append("Low humidity - faster soil drying")
        if et > 6:
            insights.append("High evapotranspiration rate")

        return jsonify({
            "recommendation": recommendation,
            "water_amount_mm": water_need,
            "urgency": urgency,
            "advice": advice,
            "insights": insights,
            "moisture": round(moisture, 1),
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    print("Smart Irrigation Advisor Running on http://127.0.0.1:5004")
    app.run(debug=True, port=5004)
