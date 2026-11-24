"""
Authentication Routes for GlamAI
Handles user registration, login, and profile retrieval via JWT.
"""

import re
from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify
import jwt
from services.user_store import (
    find_user_by_email,
    find_user_by_id,
    create_user,
    verify_password,
    get_safe_user,
    reset_user_password
)
from services.otp_store import (
    save_pending_registration,
    verify_and_consume_otp,
    get_pending_record,
    save_password_reset_otp,
    verify_and_consume_reset_otp
)
from services.email_service import send_otp_email, send_password_reset_email
from middleware.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__)

JWT_SECRET = 'glamai-secret-key-2026-luxury-beauty-tech-jwt-token'
JWT_EXPIRY_HOURS = 24


def _generate_token(user):
    """Generate a JWT token for the given user dict."""
    payload = {
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def _validate_email(email):
    """
    Validate email address format.
    """
    if not email or len(email) > 100:
        return False, "Email must be less than 100 characters."
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(pattern, email):
        return False, "Please enter a valid email address (e.g. name@example.com)."
    return True, None


def _validate_phone(phone):
    """
    Validate phone number format (E.164 compatible):
    - Allows optional leading +
    - 10 to 15 digits
    """
    if not phone:
        return False, "Phone number is required.", None
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)
    pattern = r'^\+?[0-9]{10,15}$'
    if not re.match(pattern, cleaned):
        return False, "Phone number must be 10 to 15 digits (e.g. 03001234567 or +923001234567).", None
    return True, None, cleaned


def _validate_password(password):
    """
    Password constraints:
    - Minimum 8 characters
    - At least 1 letter
    - At least 1 number
    - At least 1 special character
    """
    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r'[A-Za-z]', password):
        return False, "Password must contain at least one letter (A-Z or a-z)."
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number (0-9)."
    if not re.search(r'[@$!%*?&#^()_\-+=\[\]{}|;:,.<>\/~`]', password):
        return False, "Password must contain at least one special character (e.g. @, #, $, !)."
    return True, None


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Step 1 of 2-step registration: collect details and send OTP.
    Accepts JSON: { name, email, phone, password }
    Returns { success, pending, message } — does NOT create user yet.
    """
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "Request body is required"}), 400

    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')

    # Validate required fields
    if not name:
        return jsonify({"success": False, "error": "Name is required"}), 400

    # 1. Email validation
    is_valid_email, email_err = _validate_email(email)
    if not is_valid_email:
        return jsonify({"success": False, "error": email_err}), 400

    # 2. Phone validation
    is_valid_phone, phone_err, cleaned_phone = _validate_phone(phone)
    if not is_valid_phone:
        return jsonify({"success": False, "error": phone_err}), 400

    # 3. Password validation
    is_valid_pwd, pwd_err = _validate_password(password)
    if not is_valid_pwd:
        return jsonify({"success": False, "error": pwd_err}), 400

    # Use cleaned normalized phone and lowercase email
    phone = cleaned_phone
    email = email.lower()

    # Check for duplicate email
    existing_user = find_user_by_email(email)
    if existing_user:
        return jsonify({
            "success": False,
            "error": "An account with this email already exists"
        }), 409

    # Save pending registration and generate OTP
    otp = save_pending_registration(name, email, phone, password)

    # Send OTP email (console fallback if SMTP fails)
    email_sent, email_msg = send_otp_email(email, otp, name)

    return jsonify({
        "success": True,
        "pending": True,
        "message": f"A verification code has been sent to {email}. (Please check your Inbox and Spam folder).",
        "email_delivered": email_sent,
        "dev_code": otp
    }), 200


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """
    Step 2 of 2-step registration: verify OTP and create the user.
    Accepts JSON: { email, otp }
    Returns JWT token + user data on success.
    """
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "Request body is required"}), 400

    email = data.get('email', '').strip()
    otp_input = data.get('otp', '').strip()

    if not email or not otp_input:
        return jsonify({"success": False, "error": "Email and verification code are required"}), 400

    # Verify and consume the OTP
    success, user_data, error_msg = verify_and_consume_otp(email, otp_input)

    if not success:
        return jsonify({"success": False, "error": error_msg}), 400

    # Create the actual user account
    user = create_user(
        user_data['name'],
        user_data['email'],
        user_data['password'],
        user_data.get('phone', '')
    )

    # Generate JWT token
    token = _generate_token(user)

    return jsonify({
        "success": True,
        "message": "Account created successfully! Welcome to AI GLAM.",
        "token": token,
        "user": user
    }), 201


@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    """
    Resend OTP for a pending registration.
    Accepts JSON: { email }
    """
    data = request.get_json()
    email = (data.get('email', '') if data else '').strip()

    if not email:
        return jsonify({"success": False, "error": "Email is required"}), 400

    record = get_pending_record(email)
    if not record:
        return jsonify({
            "success": False,
            "error": "No pending registration found. Please start registration again."
        }), 404

    # Generate fresh OTP for the same pending record
    otp = save_pending_registration(
        record['name'], record['email'], record.get('phone', ''), record['password']
    )
    email_sent, email_msg = send_otp_email(email, otp, record['name'])

    return jsonify({
        "success": True,
        "message": "A new verification code has been sent to your email. (Please check your Inbox and Spam folder).",
        "email_delivered": email_sent,
        "dev_code": otp
    }), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Log in an existing user.
    Accepts JSON: { email, password }
    Returns JWT token + user data.
    """
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "Request body is required"}), 400

    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({
            "success": False,
            "error": "Email and password are required"
        }), 400

    # Find user by email
    user = find_user_by_email(email)
    if not user:
        return jsonify({
            "success": False,
            "error": "Invalid email or password"
        }), 401

    # Verify password
    if not verify_password(user['password_hash'], password):
        return jsonify({
            "success": False,
            "error": "Invalid email or password"
        }), 401

    # Generate JWT token
    safe_user = get_safe_user(user)
    token = _generate_token(safe_user)

    return jsonify({
        "success": True,
        "message": "Login successful",
        "token": token,
        "user": safe_user
    }), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """
    Get the currently authenticated user's profile.
    Requires Authorization: Bearer <token> header.
    """
    # Fetch full user data from store
    user = find_user_by_id(current_user['id'])

    if not user:
        return jsonify({
            "success": False,
            "error": "User not found"
        }), 404

    return jsonify({
        "success": True,
        "user": get_safe_user(user)
    }), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Step 1 of password reset:
    Accepts JSON: { email }
    Sends 6-digit reset code to user's registered email.
    """
    data = request.get_json()
    email = (data.get('email', '') if data else '').strip().lower()

    if not email:
        return jsonify({"success": False, "error": "Email is required"}), 400

    # Check if user exists
    user = find_user_by_email(email)
    if not user:
        return jsonify({
            "success": False,
            "error": "No AI GLAM account found with this email address."
        }), 404

    # Generate 6-digit OTP
    otp = save_password_reset_otp(email)

    # Send reset email
    send_password_reset_email(email, otp, user.get('name', 'Beauty Enthusiast'))

    return jsonify({
        "success": True,
        "message": f"Password reset code has been sent to {email}. Please check your inbox."
    }), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Step 2 of password reset:
    Accepts JSON: { email, otp, new_password }
    Verifies code and updates password.
    """
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Request body is required"}), 400

    email = data.get('email', '').strip().lower()
    otp_input = str(data.get('otp', '')).strip()
    new_password = data.get('new_password', '')

    if not email or not otp_input:
        return jsonify({"success": False, "error": "Email and verification code are required"}), 400

    # Validate password constraints
    is_valid_pwd, pwd_err = _validate_password(new_password)
    if not is_valid_pwd:
        return jsonify({"success": False, "error": pwd_err}), 400

    # Verify and consume OTP
    is_valid_otp, otp_err = verify_and_consume_reset_otp(email, otp_input)
    if not is_valid_otp:
        return jsonify({"success": False, "error": otp_err}), 400

    # Reset password in store
    success, msg = reset_user_password(email, new_password)
    if not success:
        return jsonify({"success": False, "error": msg}), 400

    return jsonify({
        "success": True,
        "message": "Your password has been successfully reset. You can now log in with your new password."
    }), 200
