from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
import json

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    phone = db.Column(db.String(15))
    farm_size = db.Column(db.Float)
    location = db.Column(db.String(100))
    # Marketplace role: "seller" (farmer selling produce) or "buyer"
    role = db.Column(db.String(20), default="seller", server_default="seller")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    listings = db.relationship("CropListing", backref="seller", lazy="dynamic",
                               cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self, include_role=True):
        data = {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "phone": self.phone,
            "farm_size": self.farm_size,
            "location": self.location,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_role:
            data["role"] = self.role or "seller"
        return data


# New Contact Table
class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(15))
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, replied, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Contact {self.name} - {self.subject}>'


class CropListing(db.Model):
    """A farmer's crop lot offered to buyers, with an AI visual grade report."""
    __tablename__ = "crop_listings"

    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)

    crop_name = db.Column(db.String(120), nullable=False)
    variety = db.Column(db.String(120))
    quantity = db.Column(db.Float, nullable=False)
    quantity_unit = db.Column(db.String(40), default="Quintals")
    farmer_grade = db.Column(db.String(20))
    harvest_date = db.Column(db.String(120))
    location = db.Column(db.String(150))
    price_per_unit = db.Column(db.Float)          # optional asking price (INR)
    image_filename = db.Column(db.String(255))

    # AI visual grading (denormalised for filtering; full report in report_json)
    grade = db.Column(db.String(20), index=True)  # A | B | C | Needs review
    confidence_band = db.Column(db.String(20))
    confidence_score = db.Column(db.Integer)

    status = db.Column(db.String(20), default="active", index=True)  # active | sold | paused
    report_json = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    inquiries = db.relationship("ListingInquiry", backref="listing", lazy="dynamic",
                                cascade="all, delete-orphan")

    @property
    def report(self):
        try:
            return json.loads(self.report_json) if self.report_json else None
        except Exception:
            return None

    def to_dict(self, full_report=False):
        data = {
            "id": self.id,
            "seller_id": self.seller_id,
            "seller_name": self.seller.username if self.seller else None,
            "seller_phone": self.seller.phone if self.seller else None,
            "seller_location": self.seller.location if self.seller else None,
            "crop_name": self.crop_name,
            "variety": self.variety,
            "quantity": self.quantity,
            "quantity_unit": self.quantity_unit,
            "farmer_grade": self.farmer_grade,
            "harvest_date": self.harvest_date,
            "location": self.location,
            "price_per_unit": self.price_per_unit,
            "image_url": f"/uploads/{self.image_filename}" if self.image_filename else None,
            "grade": self.grade,
            "confidence_band": self.confidence_band,
            "confidence_score": self.confidence_score,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "inquiry_count": self.inquiries.count() if self.inquiries else 0,
        }
        if full_report:
            data["grade_report"] = self.report
        return data


class ListingInquiry(db.Model):
    """A buyer's inquiry on a listing; sellers see these on their dashboard."""
    __tablename__ = "listing_inquiries"

    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey("crop_listings.id"),
                           nullable=False, index=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="new")  # new | contacted | closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    buyer = db.relationship("User", foreign_keys=[buyer_id])

    def to_dict(self):
        return {
            "id": self.id,
            "listing_id": self.listing_id,
            "crop_name": self.listing.crop_name if self.listing else None,
            "grade": self.listing.grade if self.listing else None,
            "listing_status": self.listing.status if self.listing else None,
            "buyer_id": self.buyer_id,
            "buyer_name": self.buyer.username if self.buyer else None,
            "buyer_email": self.buyer.email if self.buyer else None,
            "buyer_phone": self.buyer.phone if self.buyer else None,
            "buyer_location": self.buyer.location if self.buyer else None,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }