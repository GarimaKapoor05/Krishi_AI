"""
AgriAI — Shared Backend API with JWT Authentication + SQLAlchemy
"""

import os
import sys

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required

from config import Config
from models import db, User, Contact, bcrypt
from auth import auth_bp
from models import bcrypt
from marketplace import mp_bp

# Ensure the local instance folder exists for the SQLite fallback DB
os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "instance"),
            exist_ok=True)

# ====================== PATH SETUP ======================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

sys.path.append(os.path.join(BASE_DIR, "crop_recommendation"))
sys.path.append(os.path.join(BASE_DIR, "fertilizer_prediction"))
sys.path.append(os.path.join(BASE_DIR, "irrigation_advisor"))
sys.path.append(os.path.join(BASE_DIR, "market_price_prediction"))

# ====================== IMPORTS ======================

import joblib
import numpy as np

from predict_crop import predict_crop
from predict_fertilizer import (
    predict_fertilizer,
    get_dosage_for_recommendation
)
# predict_price loads TensorFlow — lazy load to avoid startup RAM spike
_forecast_price = None

def get_forecast_price():
    global _forecast_price
    if _forecast_price is None:
        from predict_price import forecast_price
        _forecast_price = forecast_price
    return _forecast_price

# ====================== APP CONFIG ======================

app = Flask(__name__)
# Bind to PORT for Render/gunicorn
PORT = int(os.environ.get("PORT", 5000))
app.config.from_object(Config)
app.config["MAX_CONTENT_LENGTH"] = 12 * 1024 * 1024  # image uploads headroom


ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://krishi-ai-sepia.vercel.app"
]

CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True, expose_headers=["Content-Type"])

@app.after_request
def after_request(response):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
    return response

jwt = JWTManager(app)

db.init_app(app)
bcrypt.init_app(app)

# Register Authentication Blueprint
app.register_blueprint(auth_bp, url_prefix="/auth")

# Register Marketplace Blueprint (crop grading, listings, inquiries)
app.register_blueprint(mp_bp)

with app.app_context():
    try:
        db.create_all()
        _mg = db.session.execute(db.text("PRAGMA table_info(user)"))
        _cols = {row[1] for row in _mg.fetchall()}
        if "role" not in _cols:
            db.session.execute(db.text(
                "ALTER TABLE user ADD COLUMN role VARCHAR(20) DEFAULT 'seller'"))
            db.session.commit()
        print("✅ Database tables created/verified")
    except Exception as e:
        db.session.rollback()
        try:
            db.session.execute(db.text(
                "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'seller'"))
            db.session.commit()
        except Exception:
            db.session.rollback()
        print(f"⚠️ Database migration note: {e}")

# ====================== LOAD MODELS ======================

irrigation_model = None

try:
    model_path = os.path.join(
        BASE_DIR,
        "irrigation_advisor",
        "model",
        "irrigation_model.joblib"
    )

    if os.path.exists(model_path):
        irrigation_model = joblib.load(model_path)
        print("✅ Irrigation Model Loaded!")

except Exception as e:
    print(f"⚠️ Irrigation model error: {e}")

# ====================== CROP RECOMMENDATION ======================

@app.route("/predict", methods=["POST"])
def predict_crop_route():

    try:
        data = request.json

        result = predict_crop(
            N=data["N"],
            P=data["P"],
            K=data["K"],
            temperature=data["temperature"],
            humidity=data["humidity"],
            ph=data["ph"],
            rainfall=data["rainfall"]
        )

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ====================== FERTILIZER PREDICTION ======================

@app.route("/predict-fertilizer", methods=["POST"])
def predict_fertilizer_route():

    try:
        data = request.json

        result = predict_fertilizer(
            crop=data["crop"],
            N=data["N"],
            P=data["P"],
            K=data["K"]
        )

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ====================== FERTILIZER DOSAGE ======================

@app.route("/fertilizer-dosage", methods=["POST"])
def fertilizer_dosage_route():

    try:
        data = request.json

        pred = predict_fertilizer(
            crop=data["crop"],
            N=data["N"],
            P=data["P"],
            K=data["K"]
        )

        dosage = get_dosage_for_recommendation(
            pred,
            land_area_ha=data["land_area_ha"],
            use_organic=data.get("use_organic", False)
        )

        return jsonify(dosage)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ====================== IRRIGATION ======================

@app.route("/irrigation/predict", methods=["POST"])
def predict_irrigation():

    try:

        data = request.get_json(force=True)

        moisture = float(data.get("moisture", 40))
        humidity = float(data.get("humidity", 50))
        temp = float(data.get("temp", 28))
        et = float(data.get("et", 4.5))
        crop = data.get("crop", "general").lower()

        if irrigation_model:

            features = np.array([
                [moisture, humidity, temp, et]
            ])

            prediction = irrigation_model.predict(features)[0]

        else:

            prediction = (
                1
                if moisture < 40 or (temp > 30 and humidity < 55)
                else 0
            )

        water_need_mm = max(
            0,
            int((60 - moisture) * 1.5)
        )

        drip_water_need = round(
            water_need_mm / 0.90,
            1
        )

        advice_db = {
            "rice": "Maintain shallow water layer during vegetative stage",
            "maize": "Critical at tasseling stage",
            "cotton": "Drip at root zone is best"
        }

        crop_info = advice_db.get(
            crop,
            "Monitor soil closely"
        )

        recommendation = (
            "Irrigate Now - Drip Recommended"
            if prediction == 1
            else "No Irrigation Needed"
        )

        urgency = (
            "High"
            if moisture < 25
            else "Medium"
        )

        return jsonify({
            "recommendation": recommendation,
            "water_amount_mm": drip_water_need,
            "urgency": urgency,
            "advice": f"{crop_info}. Use drip irrigation for best efficiency.",
            "insights": [
                "Early morning irrigation recommended",
                "Check drip lines regularly"
            ],
            "practical_tips": [
                "Mulch soil to retain moisture",
                "Monitor weather forecast"
            ],
            "moisture": round(moisture, 1),
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400



@app.route('/contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json(force=True)  # force=True helps with CORS
        
        if not data:
            return jsonify({"success": False, "error": "No data received"}), 400

        contact = Contact(
            name=data.get('name', 'Website Visitor'),
            email=data.get('email', ''),
            phone=data.get('phone'),
            subject="Call Back Request from Homepage",
            message=data.get('message', 'User requested a callback')
        )
        
        db.session.add(contact)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Thank you! Our team will call you soon."
        }), 201

    except Exception as e:
        print("Contact Error:", str(e))   # This will show in terminal
        return jsonify({"success": False, "error": str(e)}), 400

# ====================== MARKET PRICE FORECAST ======================

@app.route("/api/market/forecast", methods=["POST"])
def market_forecast_route():
    try:
        data = request.json
        forecast_price = get_forecast_price()
        result = forecast_price(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ====================== HEALTH CHECK ======================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "ok",
        "cors_test": "this is new deploy",
        "database": "connected",
        "authentication": "JWT Enabled"
    })


# ====================== RUN ======================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)