import { useState, useEffect } from 'react';
import { publicAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { usePolling } from '../hooks/usePolling';
import Menu from './Menu';
import Cart from './Cart';
import Payment from './Payment';

export default function CustomerPortal() {
  const [status, setStatus] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [statusReady, setStatusReady] = useState(false);
  const { cart, getTotalItems, clearCart } = useCart();

  // Fetch status and menu on load
  useEffect(() => {
    loadData();
  }, []);

  // Poll status every 10 seconds
  usePolling(
    async () => {
      const statusData = await publicAPI.getStatus();
      if (statusData) {
        setStatus(statusData);
      }
    },
    10000,
    statusReady
  );


  const loadData = async () => {
    try {
      console.log("setLoading")
      setLoading(true);
      setError(null);

      console.log("const menuData")
      const menuData = await publicAPI.getMenu();
      console.log("menuData obtained successfully!!")
      console.log("setMenu")
      setMenu(menuData);
      
      console.log("const statusData")
      const statusData = await publicAPI.getStatus();
      setStatus(statusData);
      setStatusReady(true); // IMPORTANT
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSuccess = () => {
    clearCart();
    setShowPayment(false);
    setShowCart(false);
    setCustomerName('');
    setCustomerPhone('');
    alert('Order placed successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isPaused = !status?.is_open;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Momo Stall</h1>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.confirm('Are you sure you want to clear all items from your cart?')) {
                  clearCart();
                }
              }}
              disabled={isPaused || getTotalItems() === 0 || showCart || showPayment}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </header>

      {/* Pause Message */}
      {isPaused && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{status.pause_message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {showPayment ? (
        <Payment
          onBack={() => setShowPayment(false)}
          onSuccess={handleOrderSuccess}
          customerName={customerName}
          customerPhone={customerPhone}
        />
      ) : showCart ? (
        <Cart
          onBack={() => setShowCart(false)}
          onCheckout={(name, phone) => {
            if (getTotalItems() === 0) {
              alert('Your cart is empty');
              return;
            }
            if (isPaused) {
              alert('Restaurant is currently paused. Please try again later.');
              return;
            }
            if (!name || !phone) {
              alert('Please enter your name and phone number');
              return;
            }
            setCustomerName(name);
            setCustomerPhone(phone);
            setShowPayment(true);
          }}
        />
      ) : (
        <Menu menu={menu} disabled={isPaused} />
      )}

      {/* Floating Cart Button */}
      {!showCart && !showPayment && (
        <button
          onClick={() => setShowCart(true)}
          disabled={isPaused || getTotalItems() === 0}
          className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed z-20"
        >
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-semibold">Cart ({getTotalItems()})</span>
          </div>
        </button>
      )}
    </div>
  );
}

