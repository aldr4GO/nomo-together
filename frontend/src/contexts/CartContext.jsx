import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const CART_STORAGE_KEY = 'momo_cart';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Initialize cart state from localStorage
  const initialCart = (() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return {};
    }
  })();

  const [cart, setCartState] = useState(initialCart);
  
  // Use ref to store the latest cart state for immediate access
  // This ensures updates aren't affected by React batching or polling re-renders
  const cartRef = useRef(initialCart);
  
  // Update ref whenever state changes
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Wrapper for setCart that also updates the ref immediately
  const setCart = useCallback((updater) => {
    if (typeof updater === 'function') {
      setCartState((prev) => {
        const newCart = updater(prev);
        cartRef.current = newCart;
        return newCart;
      });
    } else {
      cartRef.current = updater;
      setCartState(updater);
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  /**
   * Add item to cart - increments quantity by exactly 1
   * Uses ref for immediate updates to avoid batching issues
   */
  const addItem = useCallback((itemId, type = 'full') => {
    console.log('[addItem] Called with:', { itemId, type, itemIdType: typeof itemId });
    
    // Get current state from ref for immediate access
    const currentCart = { ...cartRef.current };
    const key = String(itemId);
    console.log('[addItem] Using key:', key);
    console.log('[addItem] Current cart state:', JSON.parse(JSON.stringify(currentCart)));
    
    if (!currentCart[key]) {
      currentCart[key] = { full: 0, half: 0 };
      console.log('[addItem] Created new cart entry for key:', key);
    }
    
    // Get current value (default to 0 if undefined)
    const currentQty = currentCart[key][type] || 0;
    console.log('[addItem] Current quantity:', currentQty, 'for type:', type);
    // Increment by exactly 1
    const newQty = currentQty + 1;
    currentCart[key][type] = newQty;
    console.log('[addItem] New quantity:', newQty, 'for type:', type);
    console.log('[addItem] Updated cart entry:', currentCart[key]);
    
    // Update both ref and state immediately
    cartRef.current = currentCart;
    setCart(currentCart);
    console.log('[addItem] Full cart state after update:', JSON.parse(JSON.stringify(currentCart)));
  }, [setCart]);

  /**
   * Remove item from cart - decrements quantity by exactly 1
   * Uses ref for immediate updates to avoid batching issues
   */
  const removeItem = useCallback((itemId, type = 'full') => {
    console.log('[removeItem] Called with:', { itemId, type, itemIdType: typeof itemId });
    
    // Get current state from ref for immediate access
    const currentCart = { ...cartRef.current };
    const key = String(itemId);
    console.log('[removeItem] Using key:', key);
    console.log('[removeItem] Current cart state:', JSON.parse(JSON.stringify(currentCart)));
    
    if (currentCart[key]) {
      const currentQty = currentCart[key][type] || 0;
      console.log('[removeItem] Current quantity:', currentQty, 'for type:', type);
      if (currentQty > 0) {
        // Decrement by exactly 1
        const newQty = currentQty - 1;
        currentCart[key][type] = newQty;
        console.log('[removeItem] New quantity:', newQty, 'for type:', type);
      } else {
        console.log('[removeItem] Cannot decrement - quantity is already 0');
      }
      
      // Remove item if both quantities are 0
      if ((currentCart[key].full || 0) === 0 && (currentCart[key].half || 0) === 0) {
        console.log('[removeItem] Removing item from cart (both quantities are 0)');
        delete currentCart[key];
      } else {
        console.log('[removeItem] Updated cart entry:', currentCart[key]);
      }
    } else {
      console.log('[removeItem] Item not found in cart for key:', key);
    }
    
    // Update both ref and state immediately
    cartRef.current = currentCart;
    setCart(currentCart);
    console.log('[removeItem] Full cart state after update:', JSON.parse(JSON.stringify(currentCart)));
  }, [setCart]);

  /**
   * Set item quantity directly
   */
  const setQuantity = useCallback((itemId, type, quantity) => {
    const currentCart = { ...cartRef.current };
    const key = String(itemId);
    
    if (!currentCart[key]) {
      currentCart[key] = { full: 0, half: 0 };
    }
    currentCart[key][type] = Math.max(0, quantity);
    
    // Remove item if both quantities are 0
    if ((currentCart[key].full || 0) === 0 && (currentCart[key].half || 0) === 0) {
      delete currentCart[key];
    }
    
    cartRef.current = currentCart;
    setCart(currentCart);
  }, [setCart]);

  /**
   * Clear cart
   */
  const clearCart = useCallback(() => {
    const emptyCart = {};
    cartRef.current = emptyCart;
    setCart(emptyCart);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, [setCart]);

  /**
   * Get cart item quantity
   * Uses ref for immediate access to latest state
   */
  const getQuantity = useCallback((itemId, type = 'full') => {
    const key = String(itemId);
    // Use ref for immediate access, fallback to state
    const currentCart = cartRef.current || cart;
    const quantity = currentCart[key]?.[type] || 0;
    console.log('[getQuantity] Called with:', { itemId, type, key, quantity, cartEntry: currentCart[key] });
    return quantity;
  }, [cart]);

  /**
   * Get total items in cart
   */
  const getTotalItems = useCallback(() => {
    return Object.values(cart).reduce((total, item) => {
      return total + (item.full || 0) + (item.half || 0);
    }, 0);
  }, [cart]);

  /**
   * Convert cart to order items format
   */
  const getCartItems = useCallback(() => {
    return Object.entries(cart).map(([itemId, quantities]) => ({
      menu_item_id: parseInt(itemId),
      full_qty: quantities.full || 0,
      half_qty: quantities.half || 0,
    })).filter(item => item.full_qty > 0 || item.half_qty > 0);
  }, [cart]);

  const value = {
    cart,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    getQuantity,
    getTotalItems,
    getCartItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

