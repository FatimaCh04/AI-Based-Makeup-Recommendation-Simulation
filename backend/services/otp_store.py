"""
OTP In-Memory & File-Backed Storage & Verification for AI GLAM
Stores pending registration details and 6-digit verification codes.
Supports serverless persistence via /tmp to survive Lambda re-invocations.
"""

import os
import json
import time
import random

IS_SERVERLESS = bool(os.environ.get('VERCEL') or os.environ.get('AWS_LAMBDA_FUNCTION_NAME'))
CACHE_FILE = '/tmp/glamai_pending_otps.json' if IS_SERVERLESS else os.path.join(os.path.dirname(__file__), '..', 'data', 'pending_otps.json')

# In-memory dictionary: email.lower() -> { otp, name, phone, password, expires_at }
_pending_otps = {}
# In-memory dictionary: email.lower() -> { otp, expires_at } for password resets
_password_reset_otps = {}
OTP_EXPIRATION_SECONDS = 600  # 10 minutes


def _load_cache():
    """Load pending registrations and reset codes from persistent file cache."""
    global _pending_otps, _password_reset_otps
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, dict):
                    pending = data.get('pending', {})
                    reset = data.get('reset', {})
                    # Keep valid unexpired records
                    now = time.time()
                    for k, v in pending.items():
                        if v.get('expires_at', 0) > now:
                            _pending_otps[k] = v
                    for k, v in reset.items():
                        if v.get('expires_at', 0) > now:
                            _password_reset_otps[k] = v
    except Exception:
        pass


def _save_cache():
    """Save pending registrations and reset codes to persistent file cache."""
    try:
        os.makedirs(os.path.dirname(os.path.abspath(CACHE_FILE)), exist_ok=True)
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump({
                'pending': _pending_otps,
                'reset': _password_reset_otps
            }, f)
    except Exception:
        pass


def generate_otp():
    """Generate a secure 6-digit numeric OTP code."""
    return f"{random.randint(100000, 999999)}"


def save_pending_registration(name, email, phone, password):
    """
    Store pending registration details and generate an OTP.
    Returns the generated OTP string.
    """
    _load_cache()
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
    _save_cache()

    return otp


def verify_and_consume_otp(email, otp_input):
    """
    Verify the submitted OTP for the given email.
    If valid and not expired, removes from pending and returns (True, user_data, None).
    Otherwise returns (False, None, error_message).
    """
    _load_cache()
    email_clean = email.strip().lower()
    record = _pending_otps.get(email_clean)

    if not record:
        return False, None, "No verification request found for this email. Please register again."

    if time.time() > record["expires_at"]:
        _pending_otps.pop(email_clean, None)
        _save_cache()
        return False, None, "Verification code has expired. Please request a new one."

    if record["otp"] != str(otp_input).strip():
        return False, None, "Invalid verification code. Please check and try again."

    # Consumed successfully
    user_data = _pending_otps.pop(email_clean)
    _save_cache()
    return True, user_data, None


def get_pending_record(email):
    """Get pending registration record without consuming it."""
    _load_cache()
    return _pending_otps.get(email.strip().lower())


def save_password_reset_otp(email):
    """
    Store a password reset OTP for the given email (expires in 10 minutes).
    Returns the generated 6-digit OTP string.
    """
    _load_cache()
    otp = generate_otp()
    email_clean = email.strip().lower()

    _password_reset_otps[email_clean] = {
        "otp": otp,
        "email": email_clean,
        "expires_at": time.time() + OTP_EXPIRATION_SECONDS
    }
    _save_cache()

    return otp


def verify_and_consume_reset_otp(email, otp_input):
    """
    Verify and consume password reset OTP.
    Returns (True, None) or (False, error_message).
    """
    _load_cache()
    email_clean = email.strip().lower()
    record = _password_reset_otps.get(email_clean)

    if not record:
        return False, "No active password reset request found. Please request a new code."

    if time.time() > record["expires_at"]:
        _password_reset_otps.pop(email_clean, None)
        _save_cache()
        return False, "Verification code has expired. Please request a new one."

    if record["otp"] != str(otp_input).strip():
        return False, "Invalid verification code. Please check and try again."

    # Consumed successfully
    _password_reset_otps.pop(email_clean, None)
    _save_cache()
    return True, None
