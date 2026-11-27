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
from typing import Dict, Any, List, Optional, Tuple
import requests

logger = logging.getLogger("GlamAI.Supabase")


def get_supabase_config() -> Tuple[str, str]:
    """
    Dynamically retrieve Supabase URL and Key from environment variables.
    Supports standard, service_role, Vercel, Vite, and Next.js naming conventions.
    """
    url = (
        os.environ.get("SUPABASE_URL") or
        os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or
        os.environ.get("VITE_SUPABASE_URL") or
        ""
    ).strip().rstrip("/")

    key = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or
        os.environ.get("SUPABASE_SERVICE_KEY") or
        os.environ.get("SUPABASE_SECRET_KEY") or
        os.environ.get("SUPABASE_KEY") or
        os.environ.get("SUPABASE_ANON_KEY") or
        os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or
        os.environ.get("VITE_SUPABASE_ANON_KEY") or
        ""
    ).strip()

    return url, key


def is_supabase_configured() -> bool:
    """Returns True if Supabase URL and API Key are present in environment variables."""
    url, key = get_supabase_config()
    return bool(url and key and url.startswith("http"))


def _headers(prefer_return: bool = False) -> Dict[str, str]:
    _, key = get_supabase_config()
    h = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    if prefer_return:
        h["Prefer"] = "return=representation"
    return h


def sb_test_connection() -> Dict[str, Any]:
    """
    Diagnostic helper to verify Supabase connectivity, table existence, and RLS.
    """
    url, key = get_supabase_config()
    if not url or not key:
        return {
            "configured": False,
            "status": "missing_credentials",
            "message": "SUPABASE_URL or SUPABASE_KEY is missing from environment variables."
        }

    try:
        masked_url = url[:25] + "..." if len(url) > 25 else url
        masked_key = key[:10] + "..." + key[-4:] if len(key) > 16 else "***"
        
        test_url = f"{url}/rest/v1/users?select=id&limit=1"
        res = requests.get(test_url, headers=_headers(), timeout=6)
        
        if res.status_code == 200:
            return {
                "configured": True,
                "connected": True,
                "status": "ok",
                "url": masked_url,
                "key_preview": masked_key,
                "message": "Successfully connected to Supabase and queried users table."
            }
        else:
            return {
                "configured": True,
                "connected": False,
                "status": f"http_{res.status_code}",
                "url": masked_url,
                "response": res.text,
                "message": f"Supabase responded with status {res.status_code}: {res.text}"
            }
    except Exception as exc:
        return {
            "configured": True,
            "connected": False,
            "status": "connection_error",
            "error": str(exc),
            "message": f"Could not connect to Supabase: {str(exc)}"
        }


# ── User Operations ──────────────────────────────────────────────────────────

def sb_find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Query user by email from Supabase."""
    url, key = get_supabase_config()
    if not is_supabase_configured() or not email:
        return None
    try:
        clean_email = email.strip().lower()
        encoded = urllib.parse.quote(clean_email)
        query_url = f"{url}/rest/v1/users?email=eq.{encoded}&select=*"
        res = requests.get(query_url, headers=_headers(), timeout=8)
        if res.status_code == 200:
            data = res.json()
            if data and isinstance(data, list) and len(data) > 0:
                user = data[0]
                user['saved_looks'] = sb_get_user_saved_looks(user['id'])
                return user
        else:
            print(f"[Supabase] find_user_by_email status={res.status_code}: {res.text}", flush=True)
    except Exception as exc:
        print(f"[Supabase] find_user_by_email error: {exc}", flush=True)
    return None


def sb_find_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Query user by ID from Supabase."""
    url, key = get_supabase_config()
    if not is_supabase_configured() or not user_id:
        return None
    try:
        encoded = urllib.parse.quote(str(user_id))
        query_url = f"{url}/rest/v1/users?id=eq.{encoded}&select=*"
        res = requests.get(query_url, headers=_headers(), timeout=8)
        if res.status_code == 200:
            data = res.json()
            if data and isinstance(data, list) and len(data) > 0:
                user = data[0]
                user['saved_looks'] = sb_get_user_saved_looks(user['id'])
                return user
        else:
            print(f"[Supabase] find_user_by_id status={res.status_code}: {res.text}", flush=True)
    except Exception as exc:
        print(f"[Supabase] find_user_by_id error: {exc}", flush=True)
    return None


def sb_create_user(name: str, email: str, password_hash: str, phone: str = "") -> Optional[Dict[str, Any]]:
    """Insert a new user record into Supabase."""
    url, key = get_supabase_config()
    if not is_supabase_configured():
        return None
    try:
        # 1. First try full schema payload
        payload_full = {
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
        insert_url = f"{url}/rest/v1/users"
        res = requests.post(insert_url, headers=_headers(prefer_return=True), json=payload_full, timeout=8)
        
        if res.status_code in (200, 201):
            data = res.json()
            if data and isinstance(data, list) and len(data) > 0:
                user = data[0]
                user['saved_looks'] = []
                print(f"[Supabase] User created successfully: {email}", flush=True)
                return user

        # 2. If status is 400 (likely unknown column like notifications or theme in user's schema), fallback to minimal schema
        print(f"[Supabase] Full insert failed ({res.status_code}): {res.text}. Trying minimal payload...", flush=True)
        payload_min = {
            "name": name.strip(),
            "email": email.strip().lower(),
            "phone": phone.strip() if phone else "",
            "password_hash": password_hash
        }
        res_min = requests.post(insert_url, headers=_headers(prefer_return=True), json=payload_min, timeout=8)
        if res_min.status_code in (200, 201):
            data = res_min.json()
            if data and isinstance(data, list) and len(data) > 0:
                user = data[0]
                user['saved_looks'] = []
                print(f"[Supabase] User created with minimal payload: {email}", flush=True)
                return user

        print(f"[Supabase CRITICAL] User creation failed completely! Code={res_min.status_code}, Msg={res_min.text}", flush=True)
    except Exception as exc:
        print(f"[Supabase CRITICAL] sb_create_user exception: {exc}", flush=True)
    return None


def sb_update_user(user_id: str, fields: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update user fields in Supabase."""
    url, key = get_supabase_config()
    if not is_supabase_configured() or not user_id:
        return None
    try:
        encoded = urllib.parse.quote(str(user_id))
        update_url = f"{url}/rest/v1/users?id=eq.{encoded}"
        res = requests.patch(update_url, headers=_headers(prefer_return=True), json=fields, timeout=8)
        if res.status_code in (200, 204):
            data = res.json() if res.status_code == 200 else []
            if data and isinstance(data, list) and len(data) > 0:
                user = data[0]
                user['saved_looks'] = sb_get_user_saved_looks(user['id'])
                return user
            return sb_find_user_by_id(user_id)
        else:
            print(f"[Supabase] update_user failed ({res.status_code}): {res.text}", flush=True)
    except Exception as exc:
        print(f"[Supabase] update_user error: {exc}", flush=True)
    return None


# ── Saved Looks Operations ───────────────────────────────────────────────────

def sb_get_user_saved_looks(user_id: str) -> List[Dict[str, Any]]:
    """Query all saved looks for a user from Supabase."""
    url, key = get_supabase_config()
    if not is_supabase_configured() or not user_id:
        return []
    try:
        encoded = urllib.parse.quote(str(user_id))
        query_url = f"{url}/rest/v1/saved_looks?user_id=eq.{encoded}&order=created_at.desc&select=*"
        res = requests.get(query_url, headers=_headers(), timeout=8)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list):
                return data
        else:
            print(f"[Supabase] get_user_saved_looks status={res.status_code}: {res.text}", flush=True)
    except Exception as exc:
        print(f"[Supabase] get_user_saved_looks error: {exc}", flush=True)
    return []


def sb_add_user_saved_look(user_id: str, look_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Insert a new saved look record in Supabase."""
    url, key = get_supabase_config()
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
        insert_url = f"{url}/rest/v1/saved_looks"
        res = requests.post(insert_url, headers=_headers(prefer_return=True), json=payload, timeout=8)
        if res.status_code in (200, 201):
            data = res.json()
            if data and isinstance(data, list) and len(data) > 0:
                return data[0]
        else:
            print(f"[Supabase] add_user_saved_look failed ({res.status_code}): {res.text}", flush=True)
    except Exception as exc:
        print(f"[Supabase] add_user_saved_look error: {exc}", flush=True)
    return None


def sb_update_user_saved_look(user_id: str, look_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update fields of an existing saved look in Supabase."""
    url, key = get_supabase_config()
    if not is_supabase_configured() or not user_id or not look_id:
        return None
    try:
        clean_data = {k: v for k, v in update_data.items() if k not in ('id', 'user_id')}
        enc_look = urllib.parse.quote(str(look_id))
        enc_user = urllib.parse.quote(str(user_id))
        update_url = f"{url}/rest/v1/saved_looks?id=eq.{enc_look}&user_id=eq.{enc_user}"
        res = requests.patch(update_url, headers=_headers(prefer_return=True), json=clean_data, timeout=8)
        if res.status_code in (200, 204):
            data = res.json() if res.status_code == 200 else []
            if data and isinstance(data, list) and len(data) > 0:
                return data[0]
            return clean_data
        else:
            print(f"[Supabase] update_user_saved_look failed ({res.status_code}): {res.text}", flush=True)
    except Exception as exc:
        print(f"[Supabase] update_user_saved_look error: {exc}", flush=True)
    return None


def sb_delete_user_saved_look(user_id: str, look_id: str) -> bool:
    """Delete a saved look by ID from Supabase."""
    url, key = get_supabase_config()
    if not is_supabase_configured() or not user_id or not look_id:
        return False
    try:
        enc_look = urllib.parse.quote(str(look_id))
        enc_user = urllib.parse.quote(str(user_id))
        del_url = f"{url}/rest/v1/saved_looks?id=eq.{enc_look}&user_id=eq.{enc_user}"
        res = requests.delete(del_url, headers=_headers(), timeout=8)
        return res.status_code in (200, 204)
    except Exception as exc:
        print(f"[Supabase] delete_user_saved_look error: {exc}", flush=True)
        return False
