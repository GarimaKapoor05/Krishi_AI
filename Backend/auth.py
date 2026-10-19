from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "User already exists"}), 400

    #Fix 1: Check duplicate username too
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already taken"}), 400

    farm_size_raw = data.get('farm_size')
    farm_size = float(farm_size_raw) if farm_size_raw not in (None, '', 'null') else None

    user = User(
        username=data['username'],
        email=data['email'],
        phone=data.get('phone') or None,
        farm_size=farm_size,
        location=data.get('location') or None
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "farm_size": user.farm_size,
            "location": user.location,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone": user.phone,
                "farm_size": user.farm_size,
                "location": user.location,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone": user.phone,
        "farm_size": user.farm_size,
        "location": user.location
    })