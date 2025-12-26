
from flask import Flask, send_from_directory
from flask_cors import CORS
import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from models import db
from config import Config
from routes import public_bp, admin_bp
from seed_data import seed_database

def create_app():
    """Create and configure Flask application"""
    # Serve React build in production
    frontend_dist = Path(__file__).parent.parent / 'frontend' / 'dist'
    app = Flask(__name__, static_folder=str(frontend_dist), static_url_path='')
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    # Only enable CORS in development
    if app.config.get('ENV', 'production') == 'development':
        CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)

    # Register blueprints (API routes)
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp)

    # Serve React static files (frontend)
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        # If path matches a file in dist, serve it
        if path != "" and (frontend_dist / path).exists():
            return send_from_directory(app.static_folder, path)
        else:
            # Fallback to index.html for React Router
            return send_from_directory(app.static_folder, 'index.html')

    # Initialize database
    with app.app_context():
        db.create_all()
        # Seed database if empty
        from models import MenuItem
        if MenuItem.query.count() == 0:
            seed_database()

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)

