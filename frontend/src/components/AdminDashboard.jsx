import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import OrderCard from './OrderCard';
import MerchantManager from './MerchantManager';
import MenuManager from './MenuManager';

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
      const [activeTab, setActiveTab] = useState('orders'); // orders, delivered, settings, menu
  const [orders, setOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [status, setStatus] = useState(null);
  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    // Check if already authenticated (session-based)
    // For now, we'll require login each time
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadData();
      // Poll for new orders every 5 seconds
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await adminAPI.login(password);
      setAuthenticated(true);
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [ordersData, deliveredData, merchantsData] = await Promise.all([
        adminAPI.getOrders(),
        adminAPI.getDeliveredOrders(),
        adminAPI.getMerchants(),
      ]);

      // Get status via public API
      try {
        const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:5000');
        const statusResponse = await fetch(`${apiBase}/status`, {
          credentials: 'include',
        });
        const statusData = await statusResponse.json();
        setStatus(statusData);
      } catch (error) {
        console.error('Error loading status:', error);
      }

      setOrders(ordersData);
      setDeliveredOrders(deliveredData);
      setMerchants(merchantsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleUpdateOrder = async (orderId, updates) => {
    try {
      await adminAPI.updateOrder(orderId, updates);
      await loadData(); // Reload orders
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order: ' + (error.message || 'Unknown error'));
    }
  };

  const handleUpdateStatus = async (statusData) => {
    try {
      await adminAPI.updateStatus(statusData);
      await loadData(); // Reload status
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + (error.message || 'Unknown error'));
    }
  };

  const handleActivateMerchant = async (merchantId) => {
    try {
      await adminAPI.activateMerchant(merchantId);
      await loadData(); // Reload merchants
    } catch (error) {
      console.error('Error activating merchant:', error);
      alert('Failed to activate merchant: ' + (error.message || 'Unknown error'));
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter admin password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  try {
                    const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:5000');
                    const res = await fetch(`${apiBase}/admin/export-db`, {
                      credentials: 'include',
                    });
                    if (!res.ok) throw new Error('Failed to export database');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'database_export.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    alert('Export failed: ' + (err.message || err));
                  }
                }}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                title="Download Excel export of database"
              >
                Export Excel
              </button>
              <button
                onClick={() => setAuthenticated(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'delivered'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Delivered ({deliveredOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'menu'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No active orders</p>
              </div>
            ) : (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdate={handleUpdateOrder}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'delivered' && (
          <div className="space-y-4">
            {deliveredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No delivered orders</p>
              </div>
            ) : (
              deliveredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdate={handleUpdateOrder}
                  readOnly={true}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'menu' && (
          <MenuManager />
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Restaurant Status */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Restaurant Status</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Accepting Orders
                  </label>
                  <button
                    onClick={() => handleUpdateStatus({
                      is_open: !status?.is_open,
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      status?.is_open ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        status?.is_open ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pause Message
                  </label>
                  <textarea
                    value={status?.pause_message || ''}
                    onChange={(e) => {
                      const newStatus = { ...status, pause_message: e.target.value };
                      setStatus(newStatus);
                    }}
                    onBlur={() => handleUpdateStatus({
                      pause_message: status?.pause_message,
                    })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Message shown to customers when paused"
                  />
                </div>
              </div>
            </div>

            {/* Merchant Accounts */}
            <MerchantManager
              merchants={merchants}
              onActivate={handleActivateMerchant}
            />
          </div>
        )}
      </div>
    </div>
  );
}

