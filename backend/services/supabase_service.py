"""
Supabase Database Service for GlamAI.
Communicates with Supabase PostgreSQL via high-performance PostgREST HTTPS API.
Supports Users, Beauty Profiles, and Saved Looks with zero external C-dependencies.
"""

import os
import json
import logging
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import requests

logger = logging.getLogger("GlamAI.Supabase")

# Environment variables
SUPABASE_URL = (os.environ.get("SUPABASE_URL") or "").rstrip("/")
# Prefer SERVICE_ROLE_KEY if provided (for full administrative access), otherwise standard key
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or
    os.environ.get("SUPABASE_KEY") or
    os.environ.get("SUPABASE_ANON_KEY") or
    ""
)


def is_supabase_configured() -> bool:
    """Returns True if Supabase URL and API Key are present in environment variables."""
    return bool(SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL.startswith("http"))


def _headers(prefer_return: bool = False) -> Dict[str, str]:
    h = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    if prefer_return:
        h["Prefer"] = "return=representation"
    return h


# ── User Operations ──────────────────────────────────────────────────────────

def sb_find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Query user by email from Supabase."""
    if not is_supabase_configured() or not email:
        return None
    try:
        clean_email = email.strip().lower()
        encoded = urllib.parse.quote(clean_email)
        url = f"{SUPABASE_URL}/rest/v1/users?email=eq.{encoded}&select=*"
        res = requests.get(url, headers=_headers(), timeout=8)
        if res.status_code == 200:
            data = res.json()
            if data and isinstance(data, list) and len(data) > 0:
                user = data[0]
                # Attach saved looks
                user['saved_looks'] = sb_get_user_saved_looks(user['id'])
                return user
        else:
            logger.warning("[Supabase] find_user_by_email failed (%d): %s", res.status_code, res.text)
    except Exception as exc:
        logger.error("[Supabase] find_user_by_email error: %s", exc)
    return None


def sb_find_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Query user by ID from Supabase."""
    if not is_supabase_configured() or not user_id:
        return None
    try:
        encoded = urllib.parse.quote(str(user_id))
        url = f"{SUPABASE_URL}/rest/v1/users?id=eq.{encoded}&select=*"
        res = requests.get(url, headers=_headers(), timeout=8)
        if res.status_code == 200:
            data = res.json()
            if data and isinstance(data, list) and len(data) > 0:
                user = data[0]
                user['saved_looks'] = sb_get_user_saved_looks(user['id'])
                return user
        else:
            logger.warning("[Supabase] find_user_by_id failed (%d): %s", res.status_code, res.text)
    except Exception as exc:
        logger.error("[Supabase] find_user_by_id error: %s", exc)
    return None


def sb_create_user(name: str, email: str, password_hash: str, phone: str = "") -> Optional[Dict[str, Any]]:
    """Insert a new user record into Supabase."""
    if not is_supabase_configured():
        return None
    try:
        payload = {
            "name": name.strip(),
            "email": email.strip().lower(),
            "phone": phone.strip() if phone else "",
            "password_hash": password_hash,
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
            "notifications": {
                "recommendations": True,
                "seasonal_tips": True,
                "new_shades": False
            },
            "theme": "Blush",
            "beauty_profile": None
        }
        url = f"{SUPABASE_URL}/rest/v1/users"
        res = requests.post(url, headers=_headers(prefer_return=True), json=payload, timeout=8)
        if res.status_code in (200, 201):
            data = res.json()
            if data and isinstance(data, list) and len(data) > 0:
                user = data[0]
                user['saved_looks'] = []
                return user
        else:
            logger.error("[Supabase] create_user failed (%d): %s", res.status_code, res.text)
    except Exception as exc:
        logger.error("[Supabase] create_user error: %s", exc)
    return None


def sb_update_user(user_id: str, fields: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update user fields in Supabase."""
    if not is_supabase_configured() or not user_id:
        return None
    try:
        encoded = urllib.parse.quote(str(user_id))
        url = f"{SUPABASE_URL}/rest/v1/users?id=eq.{encoded}"
        res = requests.patch(url, headers=_headers(prefer_return=True), json=fields, timeout=8)
        if res.status_code in (200, 204):
            data = res.json() if res.status_code == 200 else []
            if data and isinstance(data, list) and len(data) > 0:
                user = data[0]
                user['saved_looks'] = sb_get_user_saved_looks(user['id'])
                return user
            return sb_find_user_by_id(user_id)
        else:
            logger.error("[Supabase] update_user failed (%d): %s", res.status_code, res.text)
    except Exception as exc:
        logger.error("[Supabase] update_user error: %s", exc)
    return None


# ── Saved Looks Operations ───────────────────────────────────────────────────

def sb_get_user_saved_looks(user_id: str) -> List[Dict[str, Any]]:
    """Query all saved looks for a user from Supabase."""
    if not is_supabase_configured() or not user_id:
        return []
    try:
        encoded = urllib.parse.quote(str(user_id))
        url = f"{SUPABASE_URL}/rest/v1/saved_looks?user_id=eq.{encoded}&order=created_at.desc&select=*"
        res = requests.get(url, headers=_headers(), timeout=8)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list):
                return data
        else:
            logger.warning("[Supabase] get_user_saved_looks failed (%d): %s", res.status_code, res.text)
    except Exception as exc:
        logger.error("[Supabase] get_user_saved_looks error: %s", exc)
    return []


def sb_add_user_saved_look(user_id: str, look_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Insert a new saved look record in Supabase."""
    if not is_supabase_configured() or not user_id:
        return None
    try:
        payload = {
            "user_id": str(user_id),
            "title": look_data.get("title", f"{look_data.get('event', 'Custom')} Look"),
            "event": look_data.get("event", "Party"),
            "time_of_day": look_data.get("time_of_day", "Day"),
            "date": datetime.now(timezone.utc).strftime("%d %b %Y"),
            "thumbnail": look_data.get("thumbnail"),
            "original_image": look_data.get("original_image") or look_data.get("thumbnail"),
            "shades": look_data.get("shades", {}),
            "analysis": look_data.get("analysis", {}),
            "palette_name": look_data.get("palette_name", "")
        }
        url = f"{SUPABASE_URL}/rest/v1/saved_looks"
        res = requests.post(url, headers=_headers(prefer_return=True), json=payload, timeout=8)
        if res.status_code in (200, 201):
            data = res.json()
            if data and isinstance(data, list) and len(data) > 0:
                return data[0]
        else:
            logger.error("[Supabase] add_user_saved_look failed (%d): %s", res.status_code, res.text)
    except Exception as exc:
        logger.error("[Supabase] add_user_saved_look error: %s", exc)
    return None


def sb_update_user_saved_look(user_id: str, look_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update fields of an existing saved look in Supabase."""
    if not is_supabase_configured() or not user_id or not look_id:
        return None
    try:
        clean_data = {k: v for k, v in update_data.items() if k not in ('id', 'user_id')}
        enc_look = urllib.parse.quote(str(look_id))
        enc_user = urllib.parse.quote(str(user_id))
        url = f"{SUPABASE_URL}/rest/v1/saved_looks?id=eq.{enc_look}&user_id=eq.{enc_user}"
        res = requests.patch(url, headers=_headers(prefer_return=True), json=clean_data, timeout=8)
        if res.status_code in (200, 204):
            data = res.json() if res.status_code == 200 else []
            if data and isinstance(data, list) and len(data) > 0:
                return data[0]
            return clean_data
        else:
            logger.error("[Supabase] update_user_saved_look failed (%d): %s", res.status_code, res.text)
    except Exception as exc:
        logger.error("[Supabase] update_user_saved_look error: %s", exc)
    return None


def sb_delete_user_saved_look(user_id: str, look_id: str) -> bool:
    """Delete a saved look by ID from Supabase."""
    if not is_supabase_configured() or not user_id or not look_id:
        return False
    try:
        enc_look = urllib.parse.quote(str(look_id))
        enc_user = urllib.parse.quote(str(user_id))
        url = f"{SUPABASE_URL}/rest/v1/saved_looks?id=eq.{enc_look}&user_id=eq.{enc_user}"
        res = requests.delete(url, headers=_headers(), timeout=8)
        return res.status_code in (200, 204)
    except Exception as exc:
        logger.error("[Supabase] delete_user_saved_look error: %s", exc)
        return False
