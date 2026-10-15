from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint('auth', __name__)

VALID_ROLES = {"seller", "buyer"}


def _user_payload(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone": user.phone,
        "farm_size": user.farm_size,
        "location": user.location,
        "role": user.role or "seller",
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "User already exists"}), 400

    role = (data.get('role') or 'seller').strip().lower()
    if role not in VALID_ROLES:
        role = 'seller'

    user = User(
        username=data['username'],
        email=data['email'],
        phone=data.get('phone'),
        farm_size=data.get('farm_size'),
        location=data.get('location'),
        role=role
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "user": _user_payload(user)
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token,
            "user": _user_payload(user)
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify(_user_payload(user))


@auth_bp.route('/role', methods=['POST'])
@jwt_required()
def update_role():
    """Allow a logged-in user to switch their marketplace dashboard role."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.json or {}
    role = (data.get('role') or '').strip().lower()
    if role not in VALID_ROLES:
        return jsonify({"error": "Role must be 'seller' or 'buyer'"}), 400

    user.role = role
    db.session.commit()
    return jsonify({"role": user.role}), 200
