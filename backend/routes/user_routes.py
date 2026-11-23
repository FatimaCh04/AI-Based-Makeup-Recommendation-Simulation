"""
User Profile, Preferences, and Saved Looks Routes for AI GLAM
"""

from flask import Blueprint, jsonify, request
import jwt
from services.user_store import (
    find_user_by_id,
    get_safe_user,
    update_user_beauty_profile,
    update_user_info,
    change_user_password,
    get_user_saved_looks,
    add_user_saved_look,
    delete_user_saved_look,
    update_user_saved_look
)
from middleware.auth_middleware import token_required

user_bp = Blueprint('user', __name__)
JWT_SECRET = 'glamai-secret-key-2026-luxury-beauty-tech-jwt-token'


def _get_current_user_id_optional():
    """Extract user_id from Authorization header if present, otherwise return None."""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            return payload.get('user_id')
        except Exception:
            return None
    return None


@user_bp.route('/profile', methods=['GET'])
def get_user_profile():
    """Returns the current user profile, beauty metrics, and saved looks count"""
    user_id = _get_current_user_id_optional()

    if user_id:
        user_record = find_user_by_id(user_id)
        if user_record:
            safe = get_safe_user(user_record)
            return jsonify({
                "success": True,
                "user": safe
            }), 200

    # Unauthenticated / guest preview response
    return jsonify({
        "success": True,
        "user": {
            "id": "guest",
            "name": "Guest User",
            "email": "",
            "beauty_profile": None,
            "saved_looks": []
        }
    }), 200


@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_user_details(current_user):
    """Update user personal details like name, phone, preferences, theme."""
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No update data provided"}), 400

    updated_user = update_user_info(current_user['id'], data)
    if updated_user:
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": updated_user
        }), 200
    return jsonify({"success": False, "error": "Failed to update profile"}), 400


@user_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    """Change the user's password."""
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Missing payload"}), 400

    current_pwd = data.get('current_password', '')
    new_pwd = data.get('new_password', '')

    if not current_pwd or not new_pwd:
        return jsonify({"success": False, "error": "Both current and new password are required"}), 400

    success, message = change_user_password(current_user['id'], current_pwd, new_pwd)
    if success:
        return jsonify({"success": True, "message": message}), 200
    return jsonify({"success": False, "error": message}), 400


@user_bp.route('/profile', methods=['POST'])
@token_required
def update_profile(current_user):
    """Update current user's beauty profile."""
    data = request.get_json()
    if not data or 'beauty_profile' not in data:
        return jsonify({"success": False, "error": "beauty_profile is required"}), 400

    profile = data.get('beauty_profile')
    success = update_user_beauty_profile(current_user['id'], profile)
    if success:
        return jsonify({"success": True, "message": "Beauty profile updated"}), 200
    return jsonify({"success": False, "error": "User not found"}), 404


@user_bp.route('/saved-looks', methods=['GET'])
@token_required
def get_saved_looks(current_user):
    """Fetch all saved looks for the authenticated user."""
    looks = get_user_saved_looks(current_user['id'])
    return jsonify({
        "success": True,
        "looks": looks
    }), 200


@user_bp.route('/saved-looks', methods=['POST'])
@token_required
def save_look(current_user):
    """Save a new makeup look for the authenticated user."""
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Look data is required"}), 400

    new_look = add_user_saved_look(current_user['id'], data)
    if new_look:
        return jsonify({
            "success": True,
            "message": "Look saved successfully",
            "look": new_look
        }), 201
    return jsonify({"success": False, "error": "Failed to save look"}), 400


@user_bp.route('/saved-looks/<look_id>', methods=['DELETE'])
@token_required
def delete_saved_look(current_user, look_id):
    """Delete a saved look for the authenticated user."""
    success = delete_user_saved_look(current_user['id'], look_id)
    if success:
        return jsonify({
            "success": True,
            "message": "Look removed successfully"
        }), 200
    return jsonify({
        "success": False,
        "error": "Look not found or already removed"
    }), 404


@user_bp.route('/saved-looks/<look_id>', methods=['PUT', 'PATCH'])
@token_required
def update_saved_look(current_user, look_id):
    """Update fields on an existing saved look for the authenticated user."""
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Update data is required"}), 400

    updated = update_user_saved_look(current_user['id'], look_id, data)
    if updated:
        return jsonify({
            "success": True,
            "message": "Look updated successfully",
            "look": updated
        }), 200
    return jsonify({
        "success": False,
        "error": "Look not found"
    }), 404


@user_bp.route('/notifications', methods=['GET'])
def get_user_notifications():
    """Returns general notifications"""
    return jsonify({"success": True, "notifications": []}), 200
