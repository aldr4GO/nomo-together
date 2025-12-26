import os

class Config:
    """Application configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///momo_orders.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173').split(',')
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5174').split(',')

