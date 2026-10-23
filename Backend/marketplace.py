"""
Marketplace blueprint: crop photo grading + buyer/seller listings API.

Endpoints
---------
POST   /api/grade                    Grade an uploaded harvest photo (no listing saved)
GET    /api/listings                 Browse listings (buyer view, with filters)
GET    /api/listings/mine            Current user's listings (seller view)
POST   /api/listings                 Create a listing from an uploaded photo
GET    /api/listings/<id>            Listing detail incl. full bilingual grade report
PATCH  /api/listings/<id>            Seller updates status / asking price
DELETE /api/listings/<id>            Seller removes a listing
POST   /api/listings/<id>/inquiries  Buyer sends an inquiry on a listing
GET    /api/inquiries/received       Seller: inquiries on own listings
GET    /api/inquiries/sent           Buyer: own inquiries
GET    /api/marketplace/stats        Aggregate counts for both dashboards
GET    /uploads/<filename>           Serve stored listing photos
"""

import json
import math
import os
import re
import uuid

from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, CropListing, ListingInquiry, User
from quality_grader import grade_photo, analyze_image

mp_bp = Blueprint("marketplace", __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.abspath(os.getenv("UPLOAD_DIR") or os.path.join(BASE_DIR, "uploads"))

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8 MB
MAX_CONTENT_LENGTH = 10 * 1024 * 1024

VALID_STATUSES = {"active", "sold", "paused"}
VALID_GRADES = {"A", "B", "C", "Needs review"}


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #

def _current_user():
    uid = get_jwt_identity()
    return db.session.get(User, int(uid)) if uid else None


def _is_marketplace_admin(user):
    return bool(user and (user.role or "").strip().lower() == "admin")


def _read_image(file_storage):
    """Validate + persist an uploaded photo; returns (filename, bytes) or (None, None)."""
    if file_storage is None or not file_storage.filename:
        return None, None
    ext = os.path.splitext(file_storage.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return None, None
    data = file_storage.read()
    if not data or len(data) > MAX_IMAGE_BYTES:
        return None, None
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as fh:
        fh.write(data)
    return filename, data


def _listing_context(form):
    return {
        "crop_name": (form.get("crop_name") or "").strip(),
        "crop_variety": (form.get("variety") or form.get("crop_variety") or "").strip(),
        "description": (form.get("description") or "").strip(),
        "quantity": (form.get("quantity") or "").strip(),
        "price_per_unit": (form.get("price_per_unit") or "").strip(),
        "quantity_unit": (form.get("quantity_unit") or "Quintals").strip(),
        "farmer_grade": (form.get("farmer_grade") or "").strip(),
        "harvest_date": (form.get("harvest_date") or "").strip(),
        "location": (form.get("location") or "").strip(),
    }


def _validate_listing_context(ctx, require_crop=True, require_offer_details=False):
    errors = []
    if require_crop and not ctx["crop_name"]:
        errors.append("crop_name is required")
    qty = None
    try:
        qty = float(ctx["quantity"]) if ctx["quantity"] else None
        if qty is not None and (not math.isfinite(qty) or qty <= 0):
            errors.append("quantity must be greater than zero")
    except ValueError:
        errors.append("quantity must be numeric")
    if require_offer_details:
        if qty is None or not math.isfinite(qty) or qty <= 0:
            errors.append("quantity must be greater than zero")
        if len(ctx["description"]) < 20 or len(ctx["description"]) > 1000:
            errors.append("description must contain 20 to 1000 characters")
        if not ctx["location"]:
            errors.append("location is required")
        try:
            offer_price = float(ctx["price_per_unit"])
            if not math.isfinite(offer_price) or offer_price <= 0:
                errors.append("price_per_unit must be greater than zero")
        except (TypeError, ValueError):
            errors.append("price_per_unit is required and must be numeric")
    if ctx["farmer_grade"] and ctx["farmer_grade"].upper()[0] not in "ABC":
        errors.append("farmer_grade must be A, B or C")
    return errors


def _parse_price(value):
    if value in (None, ""):
        return None
    try:
        price = float(value)
        return price if math.isfinite(price) and price > 0 else None
    except (TypeError, ValueError):
        return None


# --------------------------------------------------------------------------- #
# Photo grading (preview — nothing is saved)
# --------------------------------------------------------------------------- #

@mp_bp.route("/api/grade", methods=["POST"])
@jwt_required()
def grade_photo_route():
    if not _current_user():
        return jsonify({"error": "Unknown user"}), 401

    file = request.files.get("image")
    if file is None or not file.filename:
        return jsonify({"error": "An image file field 'image' is required"}), 400

    # Read without saving for the preview endpoint
    data = file.read()
    if not data or len(data) > MAX_IMAGE_BYTES:
        return jsonify({"error": "Image missing or larger than 8 MB"}), 400

    ctx = _listing_context(request.form)
    errors = _validate_listing_context(ctx, require_crop=False)
    if errors:
        return jsonify({"error": "; ".join(errors)}), 400

    try:
        report = grade_photo(image_bytes=data, context=ctx)
    except Exception as exc:  # unreadable/corrupt image
        report = grade_photo(image_bytes=None, context=ctx)
        report["caution_flags"].insert(1, f"Uploaded file could not be decoded as an image: {exc}")

    return jsonify(report), 200


# --------------------------------------------------------------------------- #
# Listings
# --------------------------------------------------------------------------- #

@mp_bp.route("/api/listings", methods=["POST"])
@jwt_required()
def create_listing():
    user = _current_user()
    if not user:
        return jsonify({"error": "Unknown user"}), 401

    ctx = _listing_context(request.form)
    errors = _validate_listing_context(ctx, require_offer_details=True)
    if errors:
        return jsonify({"error": "; ".join(errors)}), 400

    file = request.files.get("image")
    filename, data = _read_image(file)
    if not filename:
        return jsonify({"error": "A valid photo (jpg/png/webp, max 8 MB) is required"}), 400

    report = grade_photo(image_bytes=data, context=ctx)

    listing = CropListing(
        seller_id=user.id,
        crop_name=ctx["crop_name"],
        variety=ctx["crop_variety"] or None,
        description=ctx["description"],
        quantity=float(ctx["quantity"]) if ctx["quantity"] else 0.0,
        quantity_unit=ctx["quantity_unit"] or "Quintals",
        farmer_grade=ctx["farmer_grade"].upper()[:1] if ctx["farmer_grade"] else None,
        harvest_date=ctx["harvest_date"] or None,
        location=ctx["location"] or user.location,
        price_per_unit=_parse_price(request.form.get("price_per_unit")),
        image_filename=filename,
        grade=report["suggested_grade"],
        confidence_band=report["confidence_band"],
        confidence_score=report["confidence_score"],
        report_json=json.dumps(report, ensure_ascii=False),
        status="active",
    )
    db.session.add(listing)
    db.session.commit()

    return jsonify({
        "listing": listing.to_dict(full_report=True),
        "grade_report": report,
    }), 201


@mp_bp.route("/api/admin/listings", methods=["GET", "POST"])
@jwt_required()
def admin_listings():
    """Create or view real farmer offers entered by a provisioned admin."""
    admin = _current_user()
    if not _is_marketplace_admin(admin):
        return jsonify({"error": "Marketplace administrator access is required."}), 403

    if request.method == "GET":
        rows = (CropListing.query
                .filter(CropListing.seller_id == admin.id, CropListing.created_by_admin.is_(True))
                .order_by(CropListing.created_at.desc())
                .all())
        return jsonify({"items": [row.to_dict(full_report=True) for row in rows]}), 200

    ctx = _listing_context(request.form)
    errors = _validate_listing_context(ctx, require_offer_details=True)
    seller_name = (request.form.get("seller_name") or "").strip()
    seller_phone = (request.form.get("seller_phone") or "").strip()
    seller_consent = (request.form.get("seller_consent") or "").strip().lower() == "true"
    if not seller_name:
        errors.append("seller_name is required")
    if not seller_phone or not re.fullmatch(r"[+()\-\s\d]{7,20}", seller_phone):
        errors.append("a valid seller_phone is required")
    if not seller_consent:
        errors.append("seller consent to publish the offer and contact details is required")
    if errors:
        return jsonify({"error": "; ".join(errors)}), 400

    filename, data = _read_image(request.files.get("image"))
    if not filename:
        return jsonify({"error": "A real harvest photo (jpg/png/webp, max 8 MB) is required."}), 400

    report = grade_photo(image_bytes=data, context=ctx)
    listing = CropListing(
        seller_id=admin.id,
        crop_name=ctx["crop_name"],
        variety=ctx["crop_variety"] or None,
        description=ctx["description"],
        seller_display_name=seller_name,
        seller_contact=seller_phone,
        created_by_admin=True,
        seller_consent_confirmed=True,
        quantity=float(ctx["quantity"]),
        quantity_unit=ctx["quantity_unit"] or "Quintals",
        farmer_grade=ctx["farmer_grade"].upper()[:1] if ctx["farmer_grade"] else None,
        harvest_date=ctx["harvest_date"] or None,
        location=ctx["location"],
        price_per_unit=_parse_price(request.form.get("price_per_unit")),
        image_filename=filename,
        grade=report["suggested_grade"],
        confidence_band=report["confidence_band"],
        confidence_score=report["confidence_score"],
        report_json=json.dumps(report, ensure_ascii=False),
        status="active",
    )
    db.session.add(listing)
    db.session.commit()
    return jsonify({"listing": listing.to_dict(full_report=True), "grade_report": report}), 201


@mp_bp.route("/api/listings", methods=["GET"])
def browse_listings():
    """Buyer marketplace feed with search + filters."""
    page = max(1, request.args.get("page", 1, type=int))
    per_page = min(50, max(1, request.args.get("per_page", 12, type=int)))

    query = CropListing.query.filter(CropListing.status == "active")

    search = (request.args.get("q") or "").strip()
    if search:
        like = f"%{search}%"
        query = query.filter(db.or_(
            CropListing.crop_name.ilike(like),
            CropListing.variety.ilike(like),
            CropListing.description.ilike(like),
            CropListing.location.ilike(like),
        ))

    grade = (request.args.get("grade") or "").strip()
    if grade in VALID_GRADES:
        query = query.filter(CropListing.grade == grade)

    crop = (request.args.get("crop") or "").strip()
    if crop:
        query = query.filter(CropListing.crop_name.ilike(f"%{crop}%"))

    location = (request.args.get("location") or "").strip()
    if location:
        query = query.filter(CropListing.location.ilike(f"%{location}%"))

    sort = request.args.get("sort", "newest")
    if sort == "grade":
        query = query.order_by(
            db.case(
                (CropListing.grade == "A", 0),
                (CropListing.grade == "B", 1),
                (CropListing.grade == "C", 2),
                else_=3,
            ),
            CropListing.created_at.desc(),
        )
    elif sort == "price_low":
        query = query.order_by(CropListing.price_per_unit.is_(None),
                               CropListing.price_per_unit.asc(),
                               CropListing.created_at.desc())
    else:
        query = query.order_by(CropListing.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": [l.to_dict() for l in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "grades_available": _grade_counts(),
    }), 200


@mp_bp.route("/api/listings/mine", methods=["GET"])
@jwt_required()
def my_listings():
    user = _current_user()
    if not user:
        return jsonify({"error": "Unknown user"}), 401

    listings = (CropListing.query
                .filter(CropListing.seller_id == user.id)
                .order_by(CropListing.created_at.desc())
                .all())
    return jsonify({"items": [l.to_dict() for l in listings]}), 200


@mp_bp.route("/api/listings/<int:listing_id>", methods=["GET"])
def listing_detail(listing_id):
    listing = db.session.get(CropListing, listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
    return jsonify({"listing": listing.to_dict(full_report=True)}), 200


@mp_bp.route("/api/listings/<int:listing_id>", methods=["PATCH"])
@jwt_required()
def update_listing(listing_id):
    user = _current_user()
    listing = db.session.get(CropListing, listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
    if not user or listing.seller_id != user.id:
        return jsonify({"error": "You can only edit your own listings"}), 403

    data = request.json or {}

    if "status" in data:
        status = str(data["status"]).strip().lower()
        if status not in VALID_STATUSES:
            return jsonify({"error": "status must be active, sold or paused"}), 400
        listing.status = status

    if "price_per_unit" in data:
        price = _parse_price(data["price_per_unit"])
        if price is None or price <= 0:
            return jsonify({"error": "price_per_unit must be greater than zero"}), 400
        listing.price_per_unit = price

    if "description" in data:
        description = str(data["description"] or "").strip()
        if len(description) < 20 or len(description) > 1000:
            return jsonify({"error": "description must contain 20 to 1000 characters"}), 400
        listing.description = description

    if "quantity" in data:
        try:
            qty = float(data["quantity"])
            if qty <= 0 or not math.isfinite(qty):
                raise ValueError
            listing.quantity = qty
        except (TypeError, ValueError):
            return jsonify({"error": "quantity must be a non-negative number"}), 400

    db.session.commit()
    return jsonify({"listing": listing.to_dict(full_report=True)}), 200


@mp_bp.route("/api/listings/<int:listing_id>", methods=["DELETE"])
@jwt_required()
def delete_listing(listing_id):
    user = _current_user()
    listing = db.session.get(CropListing, listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
    if not user or listing.seller_id != user.id:
        return jsonify({"error": "You can only delete your own listings"}), 403

    if listing.image_filename:
        try:
            os.remove(os.path.join(UPLOAD_DIR, listing.image_filename))
        except OSError:
            pass

    db.session.delete(listing)
    db.session.commit()
    return jsonify({"success": True}), 200


# --------------------------------------------------------------------------- #
# Inquiries
# --------------------------------------------------------------------------- #

@mp_bp.route("/api/listings/<int:listing_id>/inquiries", methods=["POST"])
@jwt_required()
def send_inquiry(listing_id):
    user = _current_user()
    if not user:
        return jsonify({"error": "Unknown user"}), 401

    listing = db.session.get(CropListing, listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
    if listing.status != "active":
        return jsonify({"error": "This listing is no longer accepting inquiries"}), 400
    if listing.seller_id == user.id:
        return jsonify({"error": "You cannot inquire about your own listing"}), 400

    data = request.json or {}
    message = (data.get("message") or "").strip()
    if len(message) < 5:
        return jsonify({"error": "Please include a short message (min 5 characters)"}), 400
    if len(message) > 1000:
        return jsonify({"error": "Message is too long (max 1000 characters)"}), 400

    inquiry = ListingInquiry(listing_id=listing.id, buyer_id=user.id, message=message)
    db.session.add(inquiry)
    db.session.commit()
    return jsonify({"inquiry": inquiry.to_dict()}), 201


@mp_bp.route("/api/inquiries/received", methods=["GET"])
@jwt_required()
def received_inquiries():
    user = _current_user()
    if not user:
        return jsonify({"error": "Unknown user"}), 401

    rows = (ListingInquiry.query
            .join(CropListing, ListingInquiry.listing_id == CropListing.id)
            .filter(CropListing.seller_id == user.id)
            .order_by(ListingInquiry.created_at.desc())
            .all())
    return jsonify({"items": [i.to_dict() for i in rows]}), 200


@mp_bp.route("/api/inquiries/sent", methods=["GET"])
@jwt_required()
def sent_inquiries():
    user = _current_user()
    if not user:
        return jsonify({"error": "Unknown user"}), 401

    rows = (ListingInquiry.query
            .filter(ListingInquiry.buyer_id == user.id)
            .order_by(ListingInquiry.created_at.desc())
            .all())
    return jsonify({"items": [i.to_dict() for i in rows]}), 200


# --------------------------------------------------------------------------- #
# Dashboard stats
# --------------------------------------------------------------------------- #

def _grade_counts():
    rows = (db.session.query(CropListing.grade, db.func.count(CropListing.id))
            .filter(CropListing.status == "active")
            .group_by(CropListing.grade)
            .all())
    counts = {g: 0 for g in ("A", "B", "C", "Needs review")}
    for grade, count in rows:
        counts[grade or "Needs review"] = count
    counts["total"] = sum(counts.values())
    return counts


@mp_bp.route("/api/marketplace/stats", methods=["GET"])
@jwt_required()
def marketplace_stats():
    user = _current_user()
    if not user:
        return jsonify({"error": "Unknown user"}), 401

    grade_counts = _grade_counts()

    active_total = CropListing.query.filter(CropListing.status == "active").count()
    crops_available = (db.session.query(db.func.count(db.func.distinct(CropListing.crop_name)))
                       .filter(CropListing.status == "active").scalar() or 0)

    my_listings_qs = CropListing.query.filter(CropListing.seller_id == user.id)
    my_active = my_listings_qs.filter(CropListing.status == "active").count()
    my_sold = my_listings_qs.filter(CropListing.status == "sold").count()
    my_inquiries = (ListingInquiry.query
                    .join(CropListing, ListingInquiry.listing_id == CropListing.id)
                    .filter(CropListing.seller_id == user.id)
                    .count())
    my_sent_inquiries = ListingInquiry.query.filter(ListingInquiry.buyer_id == user.id).count()

    graded = [l for l in my_listings_qs.all() if l.grade in ("A", "B", "C")]
    avg_confidence = (round(sum(l.confidence_score for l in graded) / len(graded))
                      if graded else None)

    return jsonify({
        "marketplace": {
            "active_listings": active_total,
            "crops_available": crops_available,
            "grade_counts": grade_counts,
        },
        "seller": {
            "my_listings": my_listings_qs.count(),
            "my_active": my_active,
            "my_sold": my_sold,
            "my_inquiries": my_inquiries,
            "avg_confidence": avg_confidence,
        },
        "buyer": {
            "my_sent_inquiries": my_sent_inquiries,
        },
    }), 200


# --------------------------------------------------------------------------- #
# Photo serving
# --------------------------------------------------------------------------- #

@mp_bp.route("/uploads/<path:filename>", methods=["GET"])
def serve_upload(filename):
    safe = re.sub(r"[^A-Za-z0-9._-]", "", os.path.basename(filename))
    if not safe:
        return jsonify({"error": "Invalid path"}), 400
    return send_from_directory(UPLOAD_DIR, safe)
