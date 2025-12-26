#!/usr/bin/env python
"""
Migration script to add customer_name and customer_phone columns to orders table.
Run this once to update existing database schema.
"""
import sqlite3
import os
import sys

# Get database path
backend_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(backend_dir, 'instance', 'momo_orders.db')

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    print("The database will be created automatically on next app start.")
    sys.exit(0)

print(f"Connecting to database: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if columns already exist
    cursor.execute("PRAGMA table_info(orders)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if 'customer_name' not in columns:
        print("Adding customer_name column...")
        cursor.execute("ALTER TABLE orders ADD COLUMN customer_name VARCHAR(100)")
        print("✓ Added customer_name column")
    else:
        print("✓ customer_name column already exists")
    
    if 'customer_phone' not in columns:
        print("Adding customer_phone column...")
        cursor.execute("ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(20)")
        print("✓ Added customer_phone column")
    else:
        print("✓ customer_phone column already exists")
    
    conn.commit()
    print("\nMigration completed successfully!")
    
except sqlite3.Error as e:
    print(f"Error: {e}")
    conn.rollback()
    sys.exit(1)
finally:
    conn.close()

