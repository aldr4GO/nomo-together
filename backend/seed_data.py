from models import db, MenuItem, RestaurantStatus, MerchantAccount, AdminUser
from universal_items import get_universal_items

def seed_database():
    """Initialize database with seed data"""
    
    # Clear existing data (for development)
    db.drop_all()
    db.create_all()
    
    # Menu Items - Use initial subset from universal items
    initial_menu_items = [
        'Veg Maida Momos',
        'Paneer Maida Momos',
        'Chicken Maida Momos',
        'Veg Ragi Momos',
        'Veg Oats Momos',
        'Paneer Ragi Momos',
        'Paneer Oats Momos',
        'Chicken Ragi Momos',
        'Chicken Oats Momos'
        # 'Spinach Cheese Corn',
        # 'Mushroom cheese',
        # 'Chicken Lemon',
        # 'Chicken Teriyaki',
        # 'Chicken Chilly Oil'
    ]
    
    universal_items = get_universal_items()
    for item_name in initial_menu_items:
        universal_item = next((item for item in universal_items if item['name'] == item_name), None)
        if universal_item:
            menu_item = MenuItem(
                name=universal_item['name'],
                category=universal_item['category'],
                price_full=universal_item['price_full'],
                price_half=universal_item['price_half'],
                is_available=True
            )
            db.session.add(menu_item)
    
    # Merchant UPI Accounts (placeholder)
    merchants = [
        {'name': 'Primary UPI', 'upi_id': 'merchant1@paytm', 'is_active': True},
        {'name': 'Backup UPI 1', 'upi_id': 'merchant2@phonepe', 'is_active': False},
        {'name': 'Backup UPI 2', 'upi_id': 'merchant3@ybl', 'is_active': False},
    ]
    
    for merchant_data in merchants:
        merchant = MerchantAccount(**merchant_data)
        db.session.add(merchant)
    
    # Restaurant Status
    status = RestaurantStatus(
        is_open=True,
        pause_message='We are having multiple orders. This may take time.'
    )
    db.session.add(status)
    
    # Admin User
    admin = AdminUser(username='admin')
    admin.set_password('admin123')
    db.session.add(admin)
    
    db.session.commit()
    print("Database seeded successfully!")

