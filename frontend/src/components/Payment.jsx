import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { publicAPI } from '../utils/api';
import { openUPIPayment } from '../utils/upi';

export default function Payment({ onBack, onSuccess, customerName, customerPhone }) {
  const { getCartItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [merchantUPI, setMerchantUPI] = useState(null);
  const [merchantName, setMerchantName] = useState(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [upiPaid, setUpiPaid] = useState(false);

  useEffect(() => {
    // Calculate approximate total for display
    calculateDisplayTotal();
  }, []);

  const calculateDisplayTotal = async () => {
    try {
      const menu = await publicAPI.getMenu();
      const cartItems = getCartItems();
      let total = 0;
      
      cartItems.forEach(cartItem => {
        const menuItem = menu.find(m => m.id === cartItem.menu_item_id);
        if (menuItem) {
          total += (menuItem.price_full * cartItem.full_qty);
          total += (menuItem.price_half * cartItem.half_qty);
        }
      });
      
      setAmount(total);
    } catch (error) {
      console.error('Error calculating total:', error);
    }
  };

  const handleCashPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const cartItems = getCartItems();
      const orderData = {
        items: cartItems,
        payment_method: 'cash',
        customer_name: customerName,
        customer_phone: customerPhone,
      };

      const response = await publicAPI.createOrder(orderData);
      onSuccess();
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleUPIPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const cartItems = getCartItems();
      const orderData = {
        items: cartItems,
        payment_method: 'upi',
        customer_name: customerName,
        customer_phone: customerPhone,
      };

      const response = await publicAPI.createOrder(orderData);
      const order = response.order;
      
      setOrderId(order.id);
      setAmount(order.total_amount);
      setMerchantUPI(order.merchant_upi || 'merchant@paytm'); // Fallback if not in response
      setMerchantName('Momo Stall'); // Default merchant name
      setPaymentMethod('upi');
      
      // Open UPI payment
      if (order.merchant_upi) {
        openUPIPayment(order.merchant_upi, 'Momo Stall', order.total_amount, order.id);
      } else {
        // If merchant UPI not in response, we'll still show the payment screen
        console.warn('Merchant UPI not found in order response');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUPIPayment = async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      await publicAPI.confirmPayment(orderId);
      setUpiPaid(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Error confirming payment:', error);
      setError(error.message || 'Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  if (paymentMethod === 'upi' && orderId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">UPI Payment</h2>
          
          {upiPaid ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <p className="text-lg font-semibold text-gray-900">Payment Confirmed!</p>
              <p className="text-gray-600 mt-2">Your order has been placed successfully.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  <strong>Order ID:</strong> #{orderId}
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Amount:</strong> ₹{amount.toFixed(2)}
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>UPI ID:</strong> {merchantUPI}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Please complete the payment in your UPI app and then click the button below.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={onBack}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUPIPayment}
                  disabled={loading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : "I've Paid"}
                </button>
              </div>
            </>
          )}
        </div>
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
        <h2 className="text-2xl font-bold text-gray-900">Select Payment Method</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
        <div className="text-center mb-6">
          <p className="text-2xl font-bold text-blue-600">₹{amount.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Total Amount</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Cash Payment */}
          <button
            onClick={handleCashPayment}
            disabled={loading}
            className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">💵</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Cash</p>
                <p className="text-sm text-gray-600">Pay at the counter</p>
              </div>
            </div>
          </button>

          {/* UPI Payment */}
          <button
            onClick={handleUPIPayment}
            disabled={loading}
            className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">📱</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">UPI</p>
                <p className="text-sm text-gray-600">Pay via UPI app</p>
              </div>
            </div>
          </button>
        </div>

        {loading && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
}

