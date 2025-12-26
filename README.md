# Deployment on Render.com

## Overview
This project is set up to deploy both the Flask backend and React frontend on a single Render.com web service. The backend serves the built frontend from `frontend/dist`.

## Steps

1. **Set up a new Web Service on Render.com**
   - Root Directory: `/backend`
   - Build Command:
     ```sh
     cd ../frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
     ```
   - Start Command:
     ```sh
     python run.py
     ```

2. **Environment Variables**
   - Set any required environment variables (e.g., `FLASK_ENV=production`, `PORT=10000` if needed).

3. **Static Files**
   - The backend will serve the frontend from `../frontend/dist` automatically in production.

4. **CORS**
   - CORS is enabled only in development. In production, frontend and backend are served from the same domain, so CORS is not needed.

## Local Development

For local development, run the frontend and backend separately:

```
cd frontend && npm install && npm run dev
cd backend && pip install -r requirements.txt && python run.py
```

---

# Mobile Momo Ordering Portal

A production-ready mobile food ordering system for a single momo stall, designed for real-world use by customers and staff.

## Features

- **Customer Portal** (Public, no login required)
  - Browse menu by categories (Normal Momos, Healthy Momos, Dim Sums)
  - Add items with Full/Half quantity selection
  - Real-time cart management with localStorage persistence
  - Payment options: Cash or UPI
  - UPI deep link integration for seamless payments
  - Automatic status polling (restaurant pause/resume)
  - Mobile-first responsive design

- **Admin Dashboard** (Password protected)
  - Order management with active/delivered tabs
  - Per-item delivery tracking (Full/Half checkboxes)
  - Payment status management
  - Pause/Resume ordering with custom messages
  - Merchant UPI account management (switch active account)
  - Real-time order updates

## Tech Stack

### Backend
- Python Flask
- Flask-CORS
- SQLAlchemy ORM
- SQLite database (PostgreSQL-ready design)

### Frontend
- React 18 (Vite)
- Tailwind CSS
- React Router
- Fetch API
- LocalStorage for cart persistence

## Project Structure

```
NOMO/
├── backend/
│   ├── app.py              # Flask application entry point
│   ├── models.py           # SQLAlchemy database models
│   ├── routes.py           # API route handlers
│   ├── auth.py             # Admin authentication
│   ├── config.py           # Configuration
│   ├── seed_data.py        # Database seeding
│   ├── requirements.txt    # Python dependencies
│   └── __init__.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main app router
│   │   ├── main.jsx        # Entry point
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the Flask application:
```bash
python app.py
```

The backend will start on `http://localhost:5000` by default.

The database will be automatically created and seeded with:
- Menu items (Normal Momos, Healthy Momos, Dim Sums)
- 3 placeholder merchant UPI accounts (one active)
- Default admin user (username: `admin`, password: `admin123`)
- Initial restaurant status (open)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` by default.

### Access the Application

- **Customer Portal**: `http://localhost:5173/` or `http://localhost:5173`
- **Admin Dashboard**: `http://localhost:5173/admin`

Default admin credentials:
- Username: `admin`
- Password: `admin123`

## API Documentation

### Public Endpoints

#### GET /status
Get restaurant status (open/paused).

**Response:**
```json
{
  "is_open": true,
  "pause_message": "We are having multiple orders. This may take time."
}
```

#### GET /menu
Get all available menu items.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Steam Momos",
    "category": "Normal Momos",
    "price_full": 80,
    "price_half": 45,
    "is_available": true
  }
]
```

#### POST /order
Create a new order.

**Request Body:**
```json
{
  "items": [
    {
      "menu_item_id": 1,
      "full_qty": 2,
      "half_qty": 1
    }
  ],
  "payment_method": "cash" // or "upi"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": 1,
    "timestamp": "2024-01-01T12:00:00",
    "payment_method": "cash",
    "payment_status": "pending",
    "order_status": "new",
    "total_amount": 205.0,
    "merchant_upi": null,
    "items": [...]
  }
}
```

#### POST /payment/confirm
Confirm UPI payment manually.

**Request Body:**
```json
{
  "order_id": 1
}
```

### Admin Endpoints (Require Authentication)

#### POST /admin/login
Admin login.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### GET /admin/orders
Get active orders (not fully delivered).

#### GET /admin/orders/delivered
Get delivered orders.

#### PATCH /admin/order/<id>
Update order (payment status, delivery checkboxes).

**Request Body:**
```json
{
  "payment_status": "paid",
  "items": [
    {
      "id": 1,
      "delivered_full": 2,
      "delivered_half": 1
    }
  ]
}
```

#### PATCH /admin/status
Update restaurant status.

**Request Body:**
```json
{
  "is_open": false,
  "pause_message": "Closed for today"
}
```

#### GET /admin/merchants
Get all merchant UPI accounts.

#### PATCH /admin/merchant/<id>/activate
Activate a merchant account (deactivates others).

#### GET /admin/menu
Get all menu items (including unavailable ones).

#### PATCH /admin/menu/<id>
Update menu item (toggle availability, update prices).

**Request Body:**
```json
{
  "is_available": false,
  "price_full": 90,
  "price_half": 50
}
```

#### POST /admin/menu/add
Add item from universal list to menu.

**Request Body:**
```json
{
  "name": "Cheese Momos"
}
```

#### GET /admin/universal-items
Get universal items list (all available items that can be added to menu).

## Database Models

### MenuItem
- `id`: Primary key
- `name`: Item name
- `category`: Category (Normal Momos, Healthy Momos, Dim Sums)
- `price_full`: Full portion price
- `price_half`: Half portion price
- `is_available`: Availability status

### Order
- `id`: Primary key
- `timestamp`: Order timestamp
- `payment_method`: "cash" or "upi"
- `payment_status`: "pending" or "paid"
- `order_status`: "new", "preparing", or "served"
- `total_amount`: Total order amount
- `merchant_upi_id`: Foreign key to MerchantAccount

### OrderItem
- `id`: Primary key
- `order_id`: Foreign key to Order
- `menu_item_id`: Foreign key to MenuItem
- `full_qty`: Full quantity ordered
- `half_qty`: Half quantity ordered
- `delivered_full`: Full quantity delivered
- `delivered_half`: Half quantity delivered

### RestaurantStatus
- `id`: Primary key
- `is_open`: Boolean (accepting orders)
- `pause_message`: Message shown when paused

### MerchantAccount
- `id`: Primary key
- `name`: Merchant account name
- `upi_id`: UPI ID (e.g., "merchant@paytm")
- `is_active`: Boolean (only one active at a time)

### AdminUser
- `id`: Primary key
- `username`: Admin username
- `password_hash`: Hashed password

## Key Features Explained

### Full/Half Quantity Model
Each menu item supports both Full and Half portions with separate pricing. Customers can order any combination (e.g., 2 Full + 1 Half of the same item).

### Payment Flow

**Cash Payment:**
1. Customer selects Cash
2. Order is created immediately with `payment_status: pending`
3. Admin marks payment as paid when received

**UPI Payment:**
1. Customer selects UPI
2. Order is created with active merchant UPI account
3. UPI deep link opens customer's UPI app
4. Customer completes payment in UPI app
5. Customer clicks "I've Paid" button
6. Payment status updated to `paid`

### Pause/Resume Ordering
Admin can pause accepting new orders. When paused:
- Customer portal shows pause message
- Menu is disabled
- Cart and payment are hidden
- Backend rejects new order creation attempts

### Merchant UPI Account Management
- Multiple merchant accounts can be stored
- Only one account is active at a time
- New UPI orders use the currently active account
- Admin can switch active account instantly

### Delivery Tracking
- Each order item tracks Full and Half quantities separately
- Admin marks delivery with checkboxes per item
- Order is considered "served" when all items are fully delivered
- Delivery status is independent of payment status

### Menu Management
- Admin can mark items as out of stock (removes from customer menu)
- Admin can add new items from a universal list of available items
- Universal list contains all possible items the stall can offer
- Items marked as unavailable are hidden from customers but remain in admin view
- Easy toggle to add/remove items from active menu

## Production Deployment

### Backend Deployment

1. Set environment variables:
```bash
export SECRET_KEY="your-secret-key-here"
export DATABASE_URL="postgresql://user:pass@host/dbname"  # For PostgreSQL
export CORS_ORIGINS="https://yourdomain.com"
export PORT=5000
```

2. For PostgreSQL, update `config.py`:
```python
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
```

3. Use a production WSGI server (e.g., Gunicorn):
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:create_app()
```

### Frontend Deployment

1. Build for production:
```bash
cd frontend
npm run build
```

2. Set environment variable for API URL:
```bash
export VITE_API_URL="https://api.yourdomain.com"
```

3. Deploy the `dist` folder to a static hosting service (e.g., Vercel, Netlify, or nginx).

### Security Considerations

- Change default admin password in production
- Use strong `SECRET_KEY` for Flask sessions
- Enable HTTPS for all connections
- Configure CORS properly for production domains
- Use environment variables for sensitive data
- Consider rate limiting for API endpoints
- Implement proper logging and monitoring

## Troubleshooting

### Backend Issues

**Database not found:**
- The database is created automatically on first run
- Check file permissions in the backend directory

**Import errors:**
- Ensure you're running from the project root or backend directory
- Check that all dependencies are installed

**CORS errors:**
- Verify `CORS_ORIGINS` in `config.py` includes your frontend URL
- Check that Flask-CORS is installed

### Frontend Issues

**API connection errors:**
- Verify backend is running on port 5000
- Check `VITE_API_URL` or proxy configuration in `vite.config.js`
- Ensure CORS is properly configured on backend

**Cart not persisting:**
- Check browser localStorage permissions
- Clear browser cache if needed

## Development

### Adding New Menu Items

Edit `backend/seed_data.py` and add items to the `menu_items` list, then re-run the seeding function or add items directly via database.

### Modifying Merchant Accounts

Update merchant accounts in the Admin Dashboard Settings tab, or edit `backend/seed_data.py` and re-seed.

### Changing Admin Password

Update the password hash in the database, or modify `backend/seed_data.py` and re-seed.

## License

This project is designed for production use in a real store environment.

## Support

For issues or questions, refer to the code comments and API documentation above.

