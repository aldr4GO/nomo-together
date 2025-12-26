from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class MenuItem(db.Model):
    """Menu item with Full and Half pricing"""
    __tablename__ = 'menu_items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # Normal Momos, Healthy Momos, Dim Sums
    price_full = db.Column(db.Float, nullable=False)
    price_half = db.Column(db.Float, nullable=False)
    is_available = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    order_items = db.relationship('OrderItem', backref='menu_item', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'price_full': self.price_full,
            'price_half': self.price_half,
            'is_available': self.is_available
        }


class Order(db.Model):
    """Order with payment and status tracking"""
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    payment_method = db.Column(db.String(20), nullable=False)  # cash or upi
    payment_status = db.Column(db.String(20), default='pending', nullable=False)  # pending or paid
    order_status = db.Column(db.String(20), default='new', nullable=False)  # new, preparing, served
    total_amount = db.Column(db.Float, nullable=False)
    merchant_upi_id = db.Column(db.Integer, db.ForeignKey('merchant_accounts.id'), nullable=True)
    customer_name = db.Column(db.String(100), nullable=True)
    customer_phone = db.Column(db.String(20), nullable=True)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    merchant_account = db.relationship('MerchantAccount', backref='orders', lazy=True)
    
    def to_dict(self, include_items=True):
        data = {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'order_status': self.order_status,
            'total_amount': self.total_amount,
            'merchant_upi_id': self.merchant_upi_id,
            'merchant_upi': self.merchant_account.upi_id if self.merchant_account else None,
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone
        }
        
        if include_items:
            data['items'] = [item.to_dict() for item in self.order_items]
        
        return data
    
    def is_fully_delivered(self):
        """Check if all items in the order are fully delivered"""
        if not self.order_items:
            return False
        return all(
            item.delivered_full >= item.full_qty and item.delivered_half >= item.half_qty
            for item in self.order_items
        )


class OrderItem(db.Model):
    """Order items with Full and Half quantities and delivery tracking"""
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    full_qty = db.Column(db.Integer, default=0, nullable=False)
    half_qty = db.Column(db.Integer, default=0, nullable=False)
    delivered_full = db.Column(db.Integer, default=0, nullable=False)
    delivered_half = db.Column(db.Integer, default=0, nullable=False)
    
    def to_dict(self):
        menu_item = self.menu_item
        return {
            'id': self.id,
            'menu_item_id': self.menu_item_id,
            'menu_item_name': menu_item.name if menu_item else None,
            'full_qty': self.full_qty,
            'half_qty': self.half_qty,
            'delivered_full': self.delivered_full,
            'delivered_half': self.delivered_half
        }


class RestaurantStatus(db.Model):
    """Restaurant status (open/paused) and pause message"""
    __tablename__ = 'restaurant_status'
    
    id = db.Column(db.Integer, primary_key=True)
    is_open = db.Column(db.Boolean, default=True, nullable=False)
    pause_message = db.Column(db.Text, default='We are having multiple orders. This may take time.', nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'is_open': self.is_open,
            'pause_message': self.pause_message
        }


class MerchantAccount(db.Model):
    """Merchant UPI accounts - only one active at a time"""
    __tablename__ = 'merchant_accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    upi_id = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'upi_id': self.upi_id,
            'is_active': self.is_active
        }


class AdminUser(db.Model):
    """Admin user for dashboard access"""
    __tablename__ = 'admin_users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username
        }

