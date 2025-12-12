import { useState, useCallback, useEffect } from 'react';
import { CartContext } from './CartContext';
import { useUser } from '../user-context/UseUser';
import { API_BASE_URL } from '../../../config/api';

export const CartProvider = ({ children }) => {
  const { user, token } = useUser();
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const isAuthenticated = !!user && !!token;
  
  // Generate and store guest session ID for guest carts
  const [guestSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('guestSessionId');
      if (!id) {
        id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('guestSessionId', id);
      }
      return id;
    }
    return null;
  });

  // Helper function to get request headers
  const getHeaders = (includeGuest = true) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (includeGuest && guestSessionId) {
      // For guest users, send guest session ID in header
      headers['x-guest-session-id'] = guestSessionId;
    }
    
    return headers;
  };

  // Utility: Format price in NGN
  const formatPrice = useCallback((price) => {
    if (typeof price !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(price);
  }, []);

  // Utility: Calculate sale price from discount
  const calculateSalePrice = useCallback((originalPrice, discountPercentage) => {
    const priceNum = parseFloat(originalPrice);
    const discountNum = parseFloat(discountPercentage);
    if (!isNaN(priceNum) && !isNaN(discountNum) && discountNum > 0 && discountNum <= 100) {
      return priceNum * (1 - discountNum / 100);
    }
    return priceNum;
  }, []);

  // Helper to clear messages after 3s
  const clearMessages = () => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 3000);
  };

  // --- Cart Actions ---

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch cart');
      setCart(data);
    } catch (err) {
      setError(err.message);
      setCart(null);
    } finally {
      setLoading(false);
      clearMessages();
    }
  }, [guestSessionId]);

  // Updated addToCart to accept and send slug, name, image, price
  const addToCart = useCallback(async (productId, quantity, slug, name, image, price) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productId, quantity, slug, name, image, price }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add to cart');
      setCart(data.cart);
      setSuccess(data.message);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
      clearMessages();
    }
  }, [guestSessionId]);

  const updateCartItemQuantity = useCallback(async (productId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update cart item');
      setCart(data.cart);
      setSuccess(data.message);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
      clearMessages();
    }
  }, [guestSessionId]);

  const removeCartItem = useCallback(async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/item/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to remove item from cart');

      setCart(data.cart);
      setSuccess(data.message);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
      clearMessages();
    }
  }, [guestSessionId]);

  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to clear cart');
      setCart(null);
      setSuccess(data.message);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
      clearMessages();
    }
  }, [guestSessionId]);

  // --- Wishlist Actions ---

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setWishlist(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch wishlist');
      setWishlist(data);
    } catch (err) {
      setError(err.message);
      setWishlist(null);
    } finally {
      setLoading(false);
      clearMessages();
    }
  }, [isAuthenticated, token]);

  const addToWishlist = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add to wishlist');
      setWishlist(data.wishlist);
      setSuccess(data.message);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
      clearMessages();
    }
  }, [isAuthenticated, token]);

  const removeFromWishlist = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to remove from wishlist');

      setWishlist(prevWishlist => (
        data.wishlist
          ? data.wishlist
          : {
              ...prevWishlist,
              products: prevWishlist?.products?.filter(item => item.productId !== productId)
            }
      ));
      setSuccess(data.message);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
      clearMessages();
    }
  }, [isAuthenticated, token]);

  // Load cart and wishlist when auth changes
  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        loading,
        error,
        success,
        fetchCart,
        addToCart,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        formatPrice,
        calculateSalePrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
