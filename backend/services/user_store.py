"""
User Store Service for AI GLAM
File-based JSON storage for user data and saved looks.
Handles loading, saving, finding, and creating users, as well as saved looks per user.
"""

import json
import os
import shutil
import uuid
from datetime import datetime
import bcrypt

# Determine data storage path (serverless-aware: Vercel / Lambda filesystems are read-only except /tmp)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_USERS_FILE = os.path.join(BASE_DIR, 'data', 'users.json')

IS_SERVERLESS = bool(os.environ.get('VERCEL') or os.environ.get('AWS_LAMBDA_FUNCTION_NAME'))

if IS_SERVERLESS:
    DATA_DIR = '/tmp'
    USERS_FILE = os.path.join(DATA_DIR, 'glamai_users.json')
else:
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    USERS_FILE = os.path.join(DATA_DIR, 'users.json')


def _ensure_data_dir():
    """Ensure the data directory and users.json file exist and are initialized."""
    if IS_SERVERLESS:
        if not os.path.exists(USERS_FILE):
            if os.path.exists(SOURCE_USERS_FILE):
                try:
                    shutil.copy2(SOURCE_USERS_FILE, USERS_FILE)
                except Exception:
                    pass
            if not os.path.exists(USERS_FILE):
                try:
                    with open(USERS_FILE, 'w') as f:
                        json.dump([], f)
                except Exception:
                    pass
    else:
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR, exist_ok=True)
        if not os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'w') as f:
                json.dump([], f)


def load_users():
    """Load all users from the JSON file."""
    _ensure_data_dir()
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def save_users(users):
    """Save the users list to the JSON file."""
    _ensure_data_dir()
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)


def find_user_by_email(email):
    """Find a user by their email address. Returns user dict or None."""
    users = load_users()
    for user in users:
        if user.get('email', '').lower() == email.lower():
            return user
    return None


def find_user_by_id(user_id):
    """Find a user by their ID. Returns user dict or None."""
    users = load_users()
    for user in users:
        if user.get('id') == user_id:
            return user
    return None


def create_user(name, email, password, phone=""):
    """
    Create a new user with bcrypt-hashed password and phone.
    Returns the created user dict (without password_hash).
    """
    users = load_users()

    # Hash the password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    new_user = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email.lower(),
        "phone": phone or "",
        "password_hash": password_hash,
        "created_at": datetime.utcnow().isoformat(),
        "beauty_profile": None,
        "saved_looks": []
    }

    users.append(new_user)
    save_users(users)

    return get_safe_user(new_user)


def verify_password(stored_hash, password):
    """Verify a password against a bcrypt hash."""
    return bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))


def get_safe_user(user):
    """Return user dict without sensitive fields (password_hash)."""
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", "+1 (555) 392-1084"),
        "avatar": user.get("avatar", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"),
        "notifications": user.get("notifications", {
            "recommendations": True,
            "seasonal_tips": True,
            "new_shades": False
        }),
        "theme": user.get("theme", "Blush"),
        "created_at": user.get("created_at"),
        "beauty_profile": user.get("beauty_profile"),
        "saved_looks": user.get("saved_looks", [])
    }


def update_user_beauty_profile(user_id, beauty_profile):
    """Update beauty profile for a specific user."""
    users = load_users()
    for user in users:
        if user.get('id') == user_id:
            user['beauty_profile'] = beauty_profile
            save_users(users)
            return True
    return False


def update_user_info(user_id, data):
    """Update user information like name, phone, preferences."""
    users = load_users()
    for user in users:
        if user.get('id') == user_id:
            if 'name' in data and data['name'].strip():
                user['name'] = data['name'].strip()
            if 'phone' in data:
                user['phone'] = data['phone']
            if 'notifications' in data:
                user['notifications'] = data['notifications']
            if 'theme' in data:
                user['theme'] = data['theme']
            if 'avatar' in data:
                user['avatar'] = data['avatar']
            save_users(users)
            return get_safe_user(user)
    return None


def change_user_password(user_id, current_password, new_password):
    """Verify current password and set new password."""
    users = load_users()
    for user in users:
        if user.get('id') == user_id:
            stored_hash = user.get('password_hash', '')
            if not verify_password(stored_hash, current_password):
                return False, "Current password does not match"
            if len(new_password) < 6:
                return False, "New password must be at least 6 characters"
            new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            user['password_hash'] = new_hash
            save_users(users)
            return True, "Password updated successfully"
    return False, "User not found"


def reset_user_password(email, new_password):
    """Reset password for a user identified by email address."""
    users = load_users()
    for user in users:
        if user.get('email', '').lower() == email.lower():
            new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            user['password_hash'] = new_hash
            save_users(users)
            return True, "Password has been successfully reset"
    return False, "User not found"


def get_user_saved_looks(user_id):
    """Get all saved looks for a user."""
    user = find_user_by_id(user_id)
    if user:
        return user.get('saved_looks', [])
    return []


def add_user_saved_look(user_id, look_data):
    """Add a new saved look for a user."""
    users = load_users()
    for user in users:
        if user.get('id') == user_id:
            if 'saved_looks' not in user:
                user['saved_looks'] = []
            
            look_id = str(uuid.uuid4())
            new_look = {
                "id": look_id,
                "title": look_data.get("title", f"{look_data.get('event', 'Custom')} Look"),
                "event": look_data.get("event", "Party"),
                "time_of_day": look_data.get("time_of_day", "Day"),
                "date": datetime.utcnow().strftime("%d %b %Y"),
                "created_at": datetime.utcnow().isoformat(),
                "thumbnail": look_data.get("thumbnail"),
                "original_image": look_data.get("original_image") or look_data.get("thumbnail"),
                "shades": look_data.get("shades", {}),
                "analysis": look_data.get("analysis", {}),
                "palette_name": look_data.get("palette_name", "")
            }
            user['saved_looks'].insert(0, new_look)
            save_users(users)
            return new_look
    return None


def update_user_saved_look(user_id, look_id, update_data):
    """Update fields on an existing saved look (e.g. thumbnail, shades)."""
    users = load_users()
    for user in users:
        if user.get('id') == user_id:
            for look in user.get('saved_looks', []):
                if look.get('id') == look_id:
                    for k, v in update_data.items():
                        if k != 'id':
                            look[k] = v
                    save_users(users)
                    return look
    return None


def delete_user_saved_look(user_id, look_id):
    """Delete a saved look by its ID for a specific user."""
    users = load_users()
    for user in users:
        if user.get('id') == user_id:
            if 'saved_looks' in user:
                initial_len = len(user['saved_looks'])
                user['saved_looks'] = [look for look in user['saved_looks'] if look.get('id') != look_id]
                if len(user['saved_looks']) < initial_len:
                    save_users(users)
                    return True
    return False
