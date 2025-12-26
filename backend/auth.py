from functools import wraps
from flask import session, jsonify
from models import AdminUser

def require_admin(f):
    """Decorator to require admin authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def login_admin(username, password):
    """Authenticate admin user"""
    admin = AdminUser.query.filter_by(username=username).first()
    if admin and admin.check_password(password):
        return admin
    return None

