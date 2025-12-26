from flask import Blueprint, request, jsonify, session, send_file
import os
import sqlite3
import pandas as pd
from models import (
    db, MenuItem, Order, OrderItem, RestaurantStatus, 
    MerchantAccount, AdminUser
)
from auth import require_admin, login_admin
from universal_items import get_universal_items, get_universal_item_by_name
from datetime import datetime

# Create blueprints
public_bp = Blueprint('public', __name__)
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


# ==================== ADMIN EXPORT ROUTE ====================
@admin_bp.route('/export-db', methods=['GET'])
@require_admin
def export_db():
    """Export the SQLite DB as an Excel file and send as download"""
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'momo_orders.db')
    if not os.path.exists(db_path):
        return jsonify({'error': 'Database file not found'}), 404

    conn = sqlite3.connect(db_path)
    tables = pd.read_sql("SELECT name FROM sqlite_master WHERE type='table';", conn)
    output_path = os.path.join(os.path.dirname(__file__), 'instance', 'database_export.xlsx')
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        for table in tables["name"]:
            df = pd.read_sql(f"SELECT * FROM {table}", conn)
            df.to_excel(writer, sheet_name=table, index=False)
    conn.close()

    return send_file(output_path, as_attachment=True, download_name="database_export.xlsx")


# ==================== PUBLIC ROUTES ====================

@public_bp.route('/status', methods=['GET'])
def get_status():
    """Get restaurant status"""
    status = RestaurantStatus.query.first()
    if not status:
        # Initialize if not exists
        status = RestaurantStatus(is_open=True)
        db.session.add(status)
        db.session.commit()
    
    return jsonify(status.to_dict())


@public_bp.route('/menu', methods=['GET', 'OPTIONS'])
def get_menu():
    """Get all menu items"""
    print("getting all menu items")
    items = MenuItem.query.filter_by(is_available=True).all()
    print("got all menu items")
    return jsonify([item.to_dict() for item in items])


@public_bp.route('/order', methods=['POST'])
def create_order():
    """Create a new order"""
    data = request.get_json()
    
    # Check if restaurant is open
    status = RestaurantStatus.query.first()
    if not status or not status.is_open:
        return jsonify({
            'error': 'Restaurant is currently paused',
            'message': status.pause_message if status else 'Restaurant is closed'
        }), 400
    
    # Validate required fields
    if not data or 'items' not in data or 'payment_method' not in data:
        return jsonify({'error': 'Missing required fields: items, payment_method'}), 400
    
    # Validate customer information
    customer_name = data.get('customer_name', '').strip()
    customer_phone = data.get('customer_phone', '').strip()
    
    if not customer_name:
        return jsonify({'error': 'Customer name is required'}), 400
    if not customer_phone:
        return jsonify({'error': 'Customer phone number is required'}), 400
    
    payment_method = data['payment_method'].lower()
    if payment_method not in ['cash', 'upi']:
        return jsonify({'error': 'Invalid payment method. Must be cash or upi'}), 400
    
    items = data['items']
    if not items or not isinstance(items, list):
        return jsonify({'error': 'Items must be a non-empty list'}), 400
    
    # Get active merchant for UPI orders
    merchant_id = None
    if payment_method == 'upi':
        active_merchant = MerchantAccount.query.filter_by(is_active=True).first()
        if not active_merchant:
            return jsonify({'error': 'No active merchant UPI account found'}), 400
        merchant_id = active_merchant.id
    
    # Validate items and calculate total
    total_amount = 0.0
    order_items_data = []
    
    for item_data in items:
        menu_item_id = item_data.get('menu_item_id')
        full_qty = item_data.get('full_qty', 0)
        half_qty = item_data.get('half_qty', 0)
        
        if not menu_item_id:
            return jsonify({'error': 'Missing menu_item_id in item'}), 400
        
        if full_qty < 0 or half_qty < 0:
            return jsonify({'error': 'Quantities cannot be negative'}), 400
        
        if full_qty == 0 and half_qty == 0:
            continue  # Skip items with zero quantity
        
        # Get menu item
        menu_item = MenuItem.query.get(menu_item_id)
        if not menu_item:
            return jsonify({'error': f'Menu item {menu_item_id} not found'}), 400
        
        if not menu_item.is_available:
            return jsonify({'error': f'{menu_item.name} is currently unavailable'}), 400
        
        # Calculate item total
        item_total = (menu_item.price_full * full_qty) + (menu_item.price_half * half_qty)
        total_amount += item_total
        
        order_items_data.append({
            'menu_item_id': menu_item_id,
            'full_qty': full_qty,
            'half_qty': half_qty
        })
    
    if total_amount <= 0:
        return jsonify({'error': 'Order total must be greater than 0'}), 400
    
    # Create order
    order = Order(
        payment_method=payment_method,
        payment_status='pending',
        order_status='new',
        total_amount=total_amount,
        merchant_upi_id=merchant_id,
        customer_name=customer_name,
        customer_phone=customer_phone
    )
    
    db.session.add(order)
    db.session.flush()  # Get order ID
    
    # Create order items
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=item_data['menu_item_id'],
            full_qty=item_data['full_qty'],
            half_qty=item_data['half_qty'],
            delivered_full=0,
            delivered_half=0
        )
        db.session.add(order_item)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'order': order.to_dict(),
        'message': 'Order created successfully'
    }), 201


@public_bp.route('/payment/confirm', methods=['POST'])
def confirm_payment():
    """Confirm UPI payment manually"""
    data = request.get_json()
    
    if not data or 'order_id' not in data:
        return jsonify({'error': 'Missing order_id'}), 400
    
    order_id = data['order_id']
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    if order.payment_method != 'upi':
        return jsonify({'error': 'This order is not a UPI order'}), 400
    
    if order.payment_status == 'paid':
        return jsonify({'error': 'Payment already confirmed'}), 400
    
    order.payment_status = 'unpaid'
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Payment confirmed',
        'order': order.to_dict()
    })


# ==================== ADMIN ROUTES ====================

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    """Admin login"""
    data = request.get_json()
    
    if not data or 'password' not in data:
        return jsonify({'error': 'Password required'}), 400
    
    username = data.get('username', 'admin')
    password = data.get('password')
    
    admin = login_admin(username, password)
    if not admin:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    session['admin_logged_in'] = True
    session['admin_id'] = admin.id
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'admin': admin.to_dict()
    })


@admin_bp.route('/orders', methods=['GET'])
@require_admin
def get_orders():
    """Get active orders (not fully delivered)"""
    orders = Order.query.all()
    active_orders = [order for order in orders if not order.is_fully_delivered()]
    
    # Sort by timestamp (newest first)
    active_orders.sort(key=lambda x: x.timestamp, reverse=True)
    
    return jsonify([order.to_dict() for order in active_orders])


@admin_bp.route('/orders/delivered', methods=['GET'])
@require_admin
def get_delivered_orders():
    """Get delivered orders"""
    orders = Order.query.all()
    delivered_orders = [order for order in orders if order.is_fully_delivered()]
    
    # Sort by timestamp (newest first)
    delivered_orders.sort(key=lambda x: x.timestamp, reverse=True)
    
    return jsonify([order.to_dict() for order in delivered_orders])


@admin_bp.route('/order/<int:order_id>', methods=['PATCH'])
@require_admin
def update_order(order_id):
    """Update order (payment status, order status, delivery checkboxes)"""
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    
    # Update payment status
    if 'payment_status' in data:
        if data['payment_status'] in ['pending', 'paid']:
            order.payment_status = data['payment_status']
        else:
            return jsonify({'error': 'Invalid payment_status'}), 400
    
    # Update order status
    if 'order_status' in data:
        if data['order_status'] in ['new', 'preparing', 'served']:
            order.order_status = data['order_status']
        else:
            return jsonify({'error': 'Invalid order_status'}), 400
    
    # Update delivery checkboxes for order items
    if 'items' in data and isinstance(data['items'], list):
        for item_update in data['items']:
            item_id = item_update.get('id')
            if not item_id:
                continue
            
            order_item = OrderItem.query.get(item_id)
            if not order_item or order_item.order_id != order_id:
                continue
            
            if 'delivered_full' in item_update:
                delivered_full = int(item_update['delivered_full'])
                if delivered_full < 0 or delivered_full > order_item.full_qty:
                    return jsonify({'error': 'Invalid delivered_full quantity'}), 400
                order_item.delivered_full = delivered_full
            
            if 'delivered_half' in item_update:
                delivered_half = int(item_update['delivered_half'])
                if delivered_half < 0 or delivered_half > order_item.half_qty:
                    return jsonify({'error': 'Invalid delivered_half quantity'}), 400
                order_item.delivered_half = delivered_half
    
    # Auto-update order status to served if all items are delivered
    if order.is_fully_delivered():
        order.order_status = 'served'
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Order updated successfully',
        'order': order.to_dict()
    })


@admin_bp.route('/status', methods=['PATCH'])
@require_admin
def update_status():
    """Update restaurant status"""
    status = RestaurantStatus.query.first()
    if not status:
        status = RestaurantStatus(is_open=True)
        db.session.add(status)
    
    data = request.get_json()
    
    if 'is_open' in data:
        status.is_open = bool(data['is_open'])
    
    if 'pause_message' in data:
        status.pause_message = str(data['pause_message'])
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Status updated successfully',
        'status': status.to_dict()
    })


@admin_bp.route('/merchants', methods=['GET'])
@require_admin
def get_merchants():
    """Get all merchant accounts"""
    merchants = MerchantAccount.query.all()
    return jsonify([merchant.to_dict() for merchant in merchants])


@admin_bp.route('/merchant/<int:merchant_id>/activate', methods=['PATCH'])
@require_admin
def activate_merchant(merchant_id):
    """Activate a merchant account (deactivates others)"""
    merchant = MerchantAccount.query.get(merchant_id)
    if not merchant:
        return jsonify({'error': 'Merchant not found'}), 404
    
    # Deactivate all merchants
    MerchantAccount.query.update({'is_active': False})
    
    # Activate selected merchant
    merchant.is_active = True
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Merchant activated successfully',
        'merchant': merchant.to_dict()
    })


@admin_bp.route('/menu', methods=['GET'])
@require_admin
def get_all_menu_items():
    """Get all menu items (including unavailable ones)"""
    items = MenuItem.query.order_by(MenuItem.category, MenuItem.name).all()
    return jsonify([item.to_dict() for item in items])


@admin_bp.route('/menu/<int:item_id>', methods=['PATCH'])
@require_admin
def update_menu_item(item_id):
    """Update menu item (toggle availability, update prices)"""
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({'error': 'Menu item not found'}), 404
    
    data = request.get_json()
    
    if 'is_available' in data:
        item.is_available = bool(data['is_available'])
    
    if 'price_full' in data:
        price = float(data['price_full'])
        if price < 0:
            return jsonify({'error': 'Price cannot be negative'}), 400
        item.price_full = price
    
    if 'price_half' in data:
        price = float(data['price_half'])
        if price < 0:
            return jsonify({'error': 'Price cannot be negative'}), 400
        item.price_half = price
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Menu item updated successfully',
        'item': item.to_dict()
    })


@admin_bp.route('/menu/add', methods=['POST'])
@require_admin
def add_menu_item():
    """Add item from universal list to menu"""
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'error': 'Item name required'}), 400
    
    item_name = data['name']
    
    # Check if item already exists in menu
    existing = MenuItem.query.filter_by(name=item_name).first()
    if existing:
        return jsonify({'error': f'Item "{item_name}" already exists in menu'}), 400
    
    # Get item from universal list
    universal_item = get_universal_item_by_name(item_name)
    if not universal_item:
        return jsonify({'error': f'Item "{item_name}" not found in universal list'}), 404
    
    # Allow price override if provided
    price_full = data.get('price_full', universal_item['price_full'])
    price_half = data.get('price_half', universal_item['price_half'])
    
    # Create new menu item
    menu_item = MenuItem(
        name=universal_item['name'],
        category=universal_item['category'],
        price_full=float(price_full),
        price_half=float(price_half),
        is_available=True
    )
    
    db.session.add(menu_item)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Item added to menu successfully',
        'item': menu_item.to_dict()
    }), 201


@admin_bp.route('/universal-items', methods=['GET'])
@require_admin
def get_universal_items_list():
    """Get universal items list"""
    universal_items = get_universal_items()
    
    # Get current menu items to show which are already added
    current_menu_items = MenuItem.query.all()
    current_names = {item.name for item in current_menu_items}
    
    # Mark which items are already in menu
    items_with_status = []
    for item in universal_items:
        items_with_status.append({
            **item,
            'in_menu': item['name'] in current_names
        })
    
    return jsonify(items_with_status)

