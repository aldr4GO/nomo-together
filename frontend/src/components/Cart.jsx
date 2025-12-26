import { useCart } from '../contexts/CartContext';
import { publicAPI } from '../utils/api';
import { useState, useEffect } from 'react';

export default function Cart({ onBack, onCheckout }) {
  const { cart, getCartItems } = useCart();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cart, menu]);

  const loadMenu = async () => {
    try {
      const menuData = await publicAPI.getMenu();
      setMenu(menuData);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    let calculatedTotal = 0;
    Object.entries(cart).forEach(([itemId, quantities]) => {
      const item = menu.find(m => m.id === parseInt(itemId));
      if (item) {
        calculatedTotal += (item.price_full * (quantities.full || 0));
        calculatedTotal += (item.price_half * (quantities.half || 0));
      }
    });
    setTotal(calculatedTotal);
  };

  const cartItems = Object.entries(cart)
    .map(([itemId, quantities]) => {
      const item = menu.find(m => m.id === parseInt(itemId));
      if (!item) return null;
      return {
        ...item,
        fullQty: quantities.full || 0,
        halfQty: quantities.half || 0,
      };
    })
    .filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Full: ₹{item.price_full} | Half: ₹{item.price_half}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  {/* Quantities Display */}
                  <div className="flex flex-col gap-2">
                    {item.fullQty > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Full:</span>
                        <span className="text-sm font-medium text-gray-900">{item.fullQty}</span>
                      </div>
                    )}
                    {item.halfQty > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Half:</span>
                        <span className="text-sm font-medium text-gray-900">{item.halfQty}</span>
                      </div>
                    )}
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Item Total</p>
                    <p className="font-semibold text-lg">
                      ₹{((item.price_full * item.fullQty) + (item.price_half * item.halfQty)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">₹{total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Final amount will be calculated by the server
            </p>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={customerPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setCustomerPhone(value);
                    }
                  }}
                  placeholder="10-digit phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => onCheckout(customerName, customerPhone)}
            disabled={!customerName.trim() || !customerPhone.trim()}
            className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Proceed to Payment
          </button>
        </>
      )}
    </div>
  );
}

