#!/usr/bin/env python
"""
Alternative entry point for running the Flask app.
Run from project root: python backend/run.py
Or from backend directory: python run.py
"""
import sys
import os

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Change to backend directory
os.chdir(backend_dir)

from app import create_app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

