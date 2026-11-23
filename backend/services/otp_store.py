"""
OTP In-Memory Storage & Verification for AI GLAM
Stores pending registration details and 6-digit verification codes.
"""

import time
import random

# In-memory dictionary: email.lower() -> { otp, name, phone, password, expires_at }
_pending_otps = {}
# In-memory dictionary: email.lower() -> { otp, expires_at } for password resets
_password_reset_otps = {}
OTP_EXPIRATION_SECONDS = 600  # 10 minutes


def generate_otp():
    """Generate a secure 6-digit numeric OTP code."""
    return f"{random.randint(100000, 999999)}"


def save_pending_registration(name, email, phone, password):
    """
    Store pending registration details and generate an OTP.
    Returns the generated OTP string.
    """
    otp = generate_otp()
    email_clean = email.strip().lower()

    _pending_otps[email_clean] = {
        "otp": otp,
        "name": name.strip(),
        "email": email_clean,
        "phone": phone.strip() if phone else "",
        "password": password,
        "expires_at": time.time() + OTP_EXPIRATION_SECONDS
    }

    return otp


def verify_and_consume_otp(email, otp_input):
    """
    Verify the submitted OTP for the given email.
    If valid and not expired, removes from pending and returns (True, user_data, None).
    Otherwise returns (False, None, error_message).
    """
    email_clean = email.strip().lower()
    record = _pending_otps.get(email_clean)

    if not record:
        return False, None, "No verification request found for this email. Please register again."

    if time.time() > record["expires_at"]:
        _pending_otps.pop(email_clean, None)
        return False, None, "Verification code has expired. Please request a new one."

    if record["otp"] != str(otp_input).strip():
        return False, None, "Invalid verification code. Please check and try again."

    # Consumed successfully
    user_data = _pending_otps.pop(email_clean)
    return True, user_data, None


def get_pending_record(email):
    """Get pending registration record without consuming it."""
    return _pending_otps.get(email.strip().lower())


def save_password_reset_otp(email):
    """
    Store a password reset OTP for the given email (expires in 10 minutes).
    Returns the generated 6-digit OTP string.
    """
    otp = generate_otp()
    email_clean = email.strip().lower()

    _password_reset_otps[email_clean] = {
        "otp": otp,
        "email": email_clean,
        "expires_at": time.time() + OTP_EXPIRATION_SECONDS
    }

    return otp


def verify_and_consume_reset_otp(email, otp_input):
    """
    Verify and consume password reset OTP.
    Returns (True, None) or (False, error_message).
    """
    email_clean = email.strip().lower()
    record = _password_reset_otps.get(email_clean)

    if not record:
        return False, "No active password reset request found. Please request a new code."

    if time.time() > record["expires_at"]:
        _password_reset_otps.pop(email_clean, None)
        return False, "Verification code has expired. Please request a new one."

    if record["otp"] != str(otp_input).strip():
        return False, "Invalid verification code. Please check and try again."

    # Consumed successfully
    _password_reset_otps.pop(email_clean, None)
    return True, None
