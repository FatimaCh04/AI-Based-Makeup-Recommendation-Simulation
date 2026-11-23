"""
Auth Middleware for GlamAI
JWT token validation decorator for protecting routes.
"""

from functools import wraps
from flask import request, jsonify
import jwt

JWT_SECRET = 'glamai-secret-key-2026-luxury-beauty-tech-jwt-token'


def token_required(f):
    """
    Decorator that extracts and validates a Bearer token from the Authorization header.
    Passes the decoded current_user payload to the wrapped route function.
    Returns 401 if the token is missing or invalid.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Extract Bearer token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1]

        if not token:
            return jsonify({
                "success": False,
                "error": "Authentication token is missing. Please log in."
            }), 401

        try:
            # Decode the JWT token
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            current_user = {
                "id": payload.get("user_id"),
                "email": payload.get("email"),
                "name": payload.get("name")
            }
        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "error": "Token has expired. Please log in again."
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "error": "Invalid token. Please log in again."
            }), 401

        return f(current_user, *args, **kwargs)

    return decorated
