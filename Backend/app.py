"""
AgriAI — Shared Backend API with JWT Authentication + SQLAlchemy
"""

import os
import sys
import re
import smtplib
import ssl
from email.message import EmailMessage

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required
from sqlalchemy import inspect

from config import Config
from models import db, User, Contact, bcrypt
from auth import auth_bp
from models import bcrypt
from marketplace import mp_bp
from market_intel import mi_bp
from disease import disease_bp

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
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://krishi-ai-sepia.vercel.app"
]
ALLOWED_ORIGINS.extend(
    origin.strip().rstrip("/")
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
)

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

# Register Market Intelligence Blueprint (prices, trends, forecasts, sell/hold)
app.register_blueprint(mi_bp)

app.register_blueprint(disease_bp)


with app.app_context():
    try:
        db.create_all()
        user_columns = {
            column["name"]
            for column in inspect(db.engine).get_columns("user")
        }

        if "role" not in user_columns:
            with db.engine.begin() as conn:
                if db.engine.dialect.name == "postgresql":
                    conn.execute(db.text(
                        'ALTER TABLE "user" ADD COLUMN role '
                        "VARCHAR(20) DEFAULT 'seller'"
                    ))
                else:
                    conn.execute(db.text(
                        "ALTER TABLE user ADD COLUMN role "
                        "VARCHAR(20) DEFAULT 'seller'"
                    ))

        print("✅ Database tables created/verified")
    except Exception as e:
        db.session.rollback()
        print(f"⚠️ Database migration note: {e}")


from scheduler import calculate_schedule

# ====================== CROP RECOMMENDATION ======================

@app.route("/predict", methods=["POST"])
def predict_crop_route():

    try:
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"error": "Send crop inputs as a JSON object."}), 400
        required = ("N", "P", "K", "temperature", "humidity", "ph", "rainfall")
        missing = [field for field in required if field not in data]
        if missing:
            return jsonify({"error": f"Missing required crop inputs: {', '.join(missing)}."}), 400

        result = predict_crop(
            N=data["N"],
            P=data["P"],
            K=data["K"],
            temperature=data["temperature"],
            humidity=data["humidity"],
            ph=data["ph"],
            rainfall=data["rainfall"],
            crop_group=data.get("crop_group", "any_field_crop")
        )

        return jsonify(result)

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.exception("Crop recommendation failed")
        return jsonify({"error": "The crop recommendation service encountered an error. Please try again later."}), 500


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
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"error": "Send crop and field details as a JSON object."}), 400
        return jsonify(calculate_schedule(data))
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400



@app.route('/contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"success": False, "error": "Send the contact form as JSON."}), 400

        name = str(data.get("name") or "").strip()
        email = str(data.get("email") or "").strip().lower()
        phone = str(data.get("phone") or "").strip()
        subject = str(data.get("subject") or "").strip()
        message = str(data.get("message") or "").strip()
        if not 2 <= len(name) <= 100:
            return jsonify({"success": False, "error": "Enter your name (2 to 100 characters)."}), 400
        if len(email) > 120 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
            return jsonify({"success": False, "error": "Enter a valid email address."}), 400
        if phone and (len(phone) > 20 or not re.fullmatch(r"[+()\-\s\d]{7,20}", phone)):
            return jsonify({"success": False, "error": "Enter a valid phone number or leave it blank."}), 400
        if not subject or len(subject) > 200:
            return jsonify({"success": False, "error": "Choose a subject (up to 200 characters)."}), 400
        if not 10 <= len(message) <= 3000:
            return jsonify({"success": False, "error": "Your message must be 10 to 3,000 characters."}), 400

        contact = Contact(
            name=name,
            email=email,
            phone=phone or None,
            subject=subject,
            message=message,
        )
        db.session.add(contact)
        db.session.commit()

        # Keep a durable record even when outbound email has not been configured.
        # SMTP credentials belong in the backend environment, never in the browser.
        smtp_host = (os.getenv("SMTP_HOST") or "").strip()
        smtp_username = (os.getenv("SMTP_USERNAME") or "").strip()
        smtp_password = os.getenv("SMTP_PASSWORD") or ""
        from_email = (os.getenv("CONTACT_FROM_EMAIL") or smtp_username).strip()
        to_email = (os.getenv("CONTACT_TO_EMAIL") or "amitmehta0716@gmail.com").strip()
        email_sent = False

        if smtp_host and smtp_username and smtp_password and from_email and to_email:
            try:
                mail = EmailMessage()
                mail["Subject"] = f"KrishiAI contact: {subject.replace(chr(10), ' ').replace(chr(13), ' ')}"
                mail["From"] = from_email
                mail["To"] = to_email
                mail["Reply-To"] = email
                mail.set_content(
                    f"New KrishiAI contact form submission\n\n"
                    f"Name: {name}\nEmail: {email}\nPhone: {phone or 'Not provided'}\n"
                    f"Subject: {subject}\n\nMessage:\n{message}\n"
                )
                smtp_port = int(os.getenv("SMTP_PORT", "587"))
                use_tls = (os.getenv("SMTP_USE_TLS", "true").strip().lower() in {"1", "true", "yes", "on"})
                with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                    if use_tls:
                        server.starttls(context=ssl.create_default_context())
                    server.login(smtp_username, smtp_password)
                    server.send_message(mail)
                email_sent = True
            except Exception as error:
                app.logger.exception("Contact form saved, but email delivery failed")
        else:
            app.logger.warning("Contact form saved; SMTP email delivery is not configured")

        return jsonify({
            "success": True,
            "email_sent": email_sent,
            "message": (
                "Your message was emailed to our team. We will be in touch soon."
                if email_sent else
                "Your message was saved, but email delivery is not configured. Please email us directly at amitmehta0716@gmail.com."
            ),
        }), 201

    except Exception:
        db.session.rollback()
        app.logger.exception("Contact form submission failed")
        return jsonify({"success": False, "error": "We could not save your message right now. Please email or call us directly."}), 500

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
