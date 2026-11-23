"""
Feedback & Support Routes for AI GLAM
Accepts user feedback (review, complaint, suggestion, bug report, other)
and emails it directly to the owner's inbox via SMTP.
No admin panel or database required.
"""

import re
import html
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from services.email_service import send_feedback_email

feedback_bp = Blueprint('feedback', __name__)

ALLOWED_TYPES  = {"Review", "Complaint", "Suggestion", "Bug Report", "Other"}
MAX_NAME_LEN   = 100
MAX_SUBJECT_LEN = 200
MAX_MSG_LEN    = 5000


def _sanitize(text, max_len):
    """Strip leading/trailing whitespace, escape HTML entities, truncate."""
    text = str(text).strip()
    text = html.escape(text)
    return text[:max_len]


def _validate_email_fmt(email):
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, email.strip()))


@feedback_bp.route('/submit', methods=['POST'])
def submit_feedback():
    """
    Submit user feedback and email it to the owner.
    Accepts JSON: { name, email, feedback_type, subject, message, rating }
    - name, email, feedback_type, subject, message are required.
    - rating is optional (1–5); defaults to 0 (no rating).
    Returns { success, message } or { success, error }.
    """
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"success": False, "error": "Request body is required."}), 400

    # ── Extract & sanitize ────────────────────────────────────────────────────
    name          = _sanitize(data.get("name", ""), MAX_NAME_LEN)
    email         = str(data.get("email", "")).strip().lower()
    feedback_type = str(data.get("feedback_type", "")).strip()
    subject       = _sanitize(data.get("subject", ""), MAX_SUBJECT_LEN)
    message       = _sanitize(data.get("message", ""), MAX_MSG_LEN)
    # Unescape message so it reads naturally in the email
    message = html.unescape(message)
    rating_raw    = data.get("rating", 0)

    # ── Server-side validation ────────────────────────────────────────────────
    if not name:
        return jsonify({"success": False, "error": "Name is required."}), 400

    if not email or not _validate_email_fmt(email):
        return jsonify({"success": False, "error": "A valid email address is required."}), 400

    if feedback_type not in ALLOWED_TYPES:
        return jsonify({
            "success": False,
            "error": f"Feedback type must be one of: {', '.join(sorted(ALLOWED_TYPES))}."
        }), 400

    if not subject:
        return jsonify({"success": False, "error": "Subject is required."}), 400

    if not message or len(message.strip()) < 10:
        return jsonify({
            "success": False,
            "error": "Message must be at least 10 characters."
        }), 400

    try:
        rating = int(rating_raw)
        if rating < 0 or rating > 5:
            rating = 0
    except (TypeError, ValueError):
        rating = 0

    # ── Basic spam guard: reject suspiciously short names / HTTP links in name ─
    if len(name) < 2 or "http" in name.lower():
        return jsonify({"success": False, "error": "Invalid name."}), 400

    # ── Format submission timestamp (UTC) ─────────────────────────────────────
    submitted_at = datetime.now(timezone.utc).strftime("%d %B %Y at %H:%M UTC")

    # ── Send email (synchronous so we can confirm delivery) ───────────────────
    success, err = send_feedback_email(
        sender_name   = name,
        sender_email  = email,
        feedback_type = feedback_type,
        subject       = subject,
        message       = message,
        rating        = rating,
        submitted_at  = submitted_at,
    )

    if success:
        print(
            f" [AI GLAM FEEDBACK] Submitted — type={feedback_type}, "
            f"from={email}, rating={rating}",
            flush=True
        )
        return jsonify({
            "success": True,
            "message": "Your feedback has been successfully sent. Thank you!"
        }), 200
    else:
        return jsonify({
            "success": False,
            "error": (
                "We could not deliver your feedback due to an email service issue. "
                "Please try again later."
            )
        }), 502
