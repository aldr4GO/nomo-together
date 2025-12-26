// Use proxy in development, or direct URL
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:5000');

/**
 * Make API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'access-control-allow-origin' : 'https://nomo-frontend.vercel.app',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Public API endpoints
export const publicAPI = {
  getStatus: () => apiRequest('/status'),
  getMenu: () => apiRequest('/menu'),
  createOrder: (orderData) => apiRequest('/order', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  confirmPayment: (orderId) => apiRequest('/payment/confirm', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  }),
};

// Admin API endpoints
export const adminAPI = {
  login: (password) => apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password }),
  }),
  getOrders: () => apiRequest('/admin/orders'),
  getDeliveredOrders: () => apiRequest('/admin/orders/delivered'),
  updateOrder: (orderId, updates) => apiRequest(`/admin/order/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  updateStatus: (statusData) => apiRequest('/admin/status', {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  }),
  getMerchants: () => apiRequest('/admin/merchants'),
  activateMerchant: (merchantId) => apiRequest(`/admin/merchant/${merchantId}/activate`, {
    method: 'PATCH',
  }),
  getMenuItems: () => apiRequest('/admin/menu'),
  updateMenuItem: (itemId, updates) => apiRequest(`/admin/menu/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  addMenuItem: (itemData) => apiRequest('/admin/menu/add', {
    method: 'POST',
    body: JSON.stringify(itemData),
  }),
  getUniversalItems: () => apiRequest('/admin/universal-items'),
};

