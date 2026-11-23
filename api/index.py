"""
Vercel Serverless Function entrypoint for GlamAI Backend API.
Mounts the Flask application from backend/app.py.
"""

import os
import sys

# Add the backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Set serverless indicator
os.environ['VERCEL'] = '1'

# Import Flask app
from app import app

# WSGI middleware ensuring /api prefix routing consistency on Vercel
class VercelPrefixMiddleware:
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')
        # If Vercel rewrites strip /api from PATH_INFO, restore it so Flask blueprints match
        if path and not path.startswith('/api'):
            environ['PATH_INFO'] = '/api' + path
        return self.wsgi_app(environ, start_response)

app.wsgi_app = VercelPrefixMiddleware(app.wsgi_app)
