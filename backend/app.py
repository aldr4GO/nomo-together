from flask import Flask, request
from flask_cors import CORS
import os
import sys
from config import DevelopmentConfig, ProductionConfig

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from config import Config
from models import db
from routes import public_bp, admin_bp
from seed_data import seed_database

# Define allowed origin as a constant for consistency
ALLOWED_ORIGIN = "https://nomo-frontend.vercel.app"

def create_app():
    app = Flask(__name__, static_folder="static", template_folder="static")
    print("app = Flask(__name__)")

    # env = os.environ.get("FLASK_ENV", "production")
    env = "production"

    if env == "production":
        app.config.from_object(ProductionConfig)
    else:
        app.config.from_object(DevelopmentConfig)

    print(f"env={env}")

    app.config.update(
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_SAMESITE="None"
    )

    # =========================================================================
    # FIX #1: Initialize CORS BEFORE registering blueprints
    # =========================================================================
    # This ensures flask-cors can properly wrap all routes as they're registered
    CORS(
        app,
        supports_credentials=True,
        origins=["https://nomo-frontend.vercel.app"],
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    )

    # Initialize database
    db.init_app(app)

    # =========================================================================
    # FIX #2: Register blueprints AFTER CORS initialization
    # =========================================================================
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp)

    # =========================================================================
    # FIX #3: Add manual after_request handler to guarantee CORS headers
    # =========================================================================
    # This acts as a safety net to ensure CORS headers are always present,
    # especially for preflight OPTIONS requests
    # @app.after_request
    # def after_request(response):
    #     # Always add CORS headers to every response
    #     response.headers.add('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
    #     response.headers.add('Access-Control-Allow-Headers', 
    #                        'Content-Type, Authorization, X-Requested-With')
    #     response.headers.add('Access-Control-Allow-Methods', 
    #                        'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    #     response.headers.add('Access-Control-Allow-Credentials', 'true')
        
    #     # For debugging - can be removed in production
    #     print("Response Headers:", dict(response.headers))
        
    #     return response

    # =========================================================================
    # FIX #4: Explicit OPTIONS handler for preflight requests
    # =========================================================================
    # This catches any preflight requests that might slip through
    @app.route('/<path:path>', methods=['OPTIONS'])
    def handle_options(path):
        response = app.make_default_options_response()
        return response

    # Root OPTIONS handler
    @app.route('/', methods=['OPTIONS'])
    def handle_root_options():
        response = app.make_default_options_response()
        return response

    # Add a test route to check CORS headers
    @app.route('/cors-test')
    def cors_test():
        return {"message": "CORS test successful"}

    # Database initialization
    with app.app_context():
        db.create_all()
        from models import MenuItem
        if MenuItem.query.count() == 0:
            print("seeding database")
            seed_database()

    return app

app = create_app()

# ============================================================================
# HOW TO TEST THAT CORS IS WORKING:
# ============================================================================
#
# 1. Using curl to test preflight (OPTIONS) request:
#    
#    curl -X OPTIONS https://nomo-backend-otfw.onrender.com/menu \
#      -H "Origin: https://nomo-frontend.vercel.app" \
#      -H "Access-Control-Request-Method: GET" \
#      -H "Access-Control-Request-Headers: Content-Type" \
#      -v
#
#    Expected: You should see these headers in the response:
#    - Access-Control-Allow-Origin: https://nomo-frontend.vercel.app
#    - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
#    - Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
#    - Access-Control-Allow-Credentials: true
#
# 2. Using curl to test actual GET request:
#
#    curl https://nomo-backend-otfw.onrender.com/menu \
#      -H "Origin: https://nomo-frontend.vercel.app" \
#      -v
#
# 3. Test from browser console on your frontend:
#
#    fetch('https://nomo-backend-otfw.onrender.com/menu', {
#      method: 'GET',
#      credentials: 'include',
#      headers: { 'Content-Type': 'application/json' }
#    }).then(r => r.json()).then(console.log).catch(console.error)
#
# 4. Use the /cors-test endpoint for quick verification:
#
#    curl https://nomo-backend-otfw.onrender.com/cors-test \
#      -H "Origin: https://nomo-frontend.vercel.app" \
#      -v
#
# ============================================================================



# from flask import Flask
# from flask_cors import CORS
# import os
# import sys
# from config import DevelopmentConfig, ProductionConfig

# # Add backend directory to path
# backend_dir = os.path.dirname(os.path.abspath(__file__))
# sys.path.insert(0, backend_dir)

# from config import Config
# from models import db
# from routes import public_bp, admin_bp
# from seed_data import seed_database

# def create_app():
#     app = Flask(__name__)

#     # Add a test route to check CORS headers
#     @app.route('/cors-test')
#     def cors_test():
#         return {"message": "CORS test successful"}

#     # Log response headers for every request
#     @app.after_request
#     def after_request(response):
#         print("Response Headers:", dict(response.headers))
#         return response
#     print("app = Flask(__name__)")

#     # env = os.environ.get("FLASK_ENV", "production")
#     env = "production"

#     if env == "production":
#         app.config.from_object(ProductionConfig)
#     else:
#         app.config.from_object(DevelopmentConfig)

#     print(f"env={env}")

#     db.init_app(app)

#     # REGISTER BLUEPRINTS FIRST
#     app.register_blueprint(public_bp)
#     app.register_blueprint(admin_bp)

#     # APPLY CORS AFTER ROUTES EXIST
#     cors = CORS(
#         app,
#         resources={r"/*": {"origins": ["https://nomo-frontend.vercel.app"]}},
#         supports_credentials=True
#     )
#     with app.app_context():
#         db.create_all()
#         from models import MenuItem
#         if MenuItem.query.count() == 0:
#             print("seeding database")
#             seed_database()

#     return app

# app = create_app()

