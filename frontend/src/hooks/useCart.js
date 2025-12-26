import { useState, useEffect } from 'react';

const CART_STORAGE_KEY = 'momo_cart';

/**
 * Custom hook for cart management with localStorage
 */
export function useCart() {
  const [cart, setCart] = useState(() => {
    // Load from localStorage on init
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return {};
    }
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  /**
   * Add item to cart
   */
  const addItem = (itemId, type = 'full') => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (!newCart[itemId]) {
        newCart[itemId] = { full: 0, half: 0 };
      }
      newCart[itemId][type] = (newCart[itemId][type] || 0) + 1;
      return newCart;
    });
  };

  /**
   * Remove item from cart
   */
  const removeItem = (itemId, type = 'full') => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId]) {
        if (newCart[itemId][type] > 0) {
          newCart[itemId][type] = newCart[itemId][type] - 1;
        }
        // Remove item if both quantities are 0
        if (newCart[itemId].full === 0 && newCart[itemId].half === 0) {
          delete newCart[itemId];
        }
      }
      return newCart;
    });
  };

  /**
   * Set item quantity directly
   */
  const setQuantity = (itemId, type, quantity) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (!newCart[itemId]) {
        newCart[itemId] = { full: 0, half: 0 };
      }
      newCart[itemId][type] = Math.max(0, quantity);
      
      // Remove item if both quantities are 0
      if (newCart[itemId].full === 0 && newCart[itemId].half === 0) {
        delete newCart[itemId];
      }
      
      return newCart;
    });
  };

  /**
   * Clear cart
   */
  const clearCart = () => {
    setCart({});
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  /**
   * Get cart item quantity
   */
  const getQuantity = (itemId, type = 'full') => {
    return cart[itemId]?.[type] || 0;
  };

  /**
   * Get total items in cart
   */
  const getTotalItems = () => {
    return Object.values(cart).reduce((total, item) => {
      return total + (item.full || 0) + (item.half || 0);
    }, 0);
  };

  /**
   * Convert cart to order items format
   */
  const getCartItems = () => {
    return Object.entries(cart).map(([itemId, quantities]) => ({
      menu_item_id: parseInt(itemId),
      full_qty: quantities.full || 0,
      half_qty: quantities.half || 0,
    })).filter(item => item.full_qty > 0 || item.half_qty > 0);
  };

  return {
    cart,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    getQuantity,
    getTotalItems,
    getCartItems,
  };
}

