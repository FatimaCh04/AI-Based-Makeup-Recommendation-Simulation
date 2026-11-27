"""
GlamAI - AI-Based Makeup Recommendation and Virtual Makeup Simulation System
Backend API Server (Flask)
Architecture: Flask + OpenCV + Recommendation Engine + File-based JSON Storage
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.analysis_routes import analysis_bp
from routes.recommendation_routes import recommendation_bp
from routes.user_routes import user_bp
from routes.auth_routes import auth_bp
from routes.feedback_routes import feedback_bp

app = Flask(__name__)

# ── CORS ──────────────────────────────────────────────────────────────────────
# In production set FRONTEND_URL env var to your Vercel domain.
# Falls back to allowing all origins for local development.
FRONTEND_URL = os.environ.get("FRONTEND_URL", "*")
CORS(app, resources={r"/api/*": {"origins": FRONTEND_URL}})

# ── Blueprints ────────────────────────────────────────────────────────────────
app.register_blueprint(analysis_bp,        url_prefix='/api/analysis')
app.register_blueprint(recommendation_bp,  url_prefix='/api/recommendations')
app.register_blueprint(user_bp,            url_prefix='/api/user')
app.register_blueprint(auth_bp,            url_prefix='/api/auth')
app.register_blueprint(feedback_bp,        url_prefix='/api/feedback')

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "online",
        "service": "AI Glam Backend API",
        "version": "1.0.0",
        "endpoints": {
            "health":          "/api/health",
            "auth":            "/api/auth",
            "analysis":        "/api/analysis",
            "recommendations": "/api/recommendations",
            "user":            "/api/user",
            "feedback":        "/api/feedback",
        }
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    from services.supabase_service import sb_test_connection
    sb_status = sb_test_connection()
    return jsonify({
        "status": "healthy",
        "service": "GlamAI Backend API",
        "version": "1.0.0",
        "database": sb_status
    }), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ── Entry point (dev only — production uses gunicorn) ─────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    print(f"[GlamAI] Flask Server starting on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
