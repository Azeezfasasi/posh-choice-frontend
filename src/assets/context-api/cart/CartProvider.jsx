import { useState, useCallback, useEffect } from 'react';
import { CartContext } from './CartContext';
import { useUser } from '../user-context/UseUser';
import { API_BASE_URL } from '../../../config/api';

export const CartProvider = ({ children }) => {
//   const { token, isAuthenticated } = useAuth();
  const { user, token } = useUser();
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const isAuthenticated = !!user && !!token;

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
    if (!isAuthenticated || !token) {
      setCart(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  }, [isAuthenticated, token]);

  // Updated addToCart to accept and send slug, name, image, price
  const addToCart = useCallback(async (productId, quantity, slug, name, image, price) => {
    if (!isAuthenticated || !token) {
      setError('Please log in to add items to your cart.');
      clearMessages();
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
  }, [isAuthenticated, token]);

  const updateCartItemQuantity = useCallback(async (productId, quantity) => {
    if (!isAuthenticated || !token) {
      setError('Please log in to update cart items.');
      clearMessages();
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
  }, [isAuthenticated, token]);

  const removeCartItem = useCallback(async (itemId) => {
    if (!isAuthenticated || !token) {
      setError('Please log in to remove items from your cart.');
      clearMessages();
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  }, [isAuthenticated, token]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setError('Please log in to clear your cart.');
      clearMessages();
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  }, [isAuthenticated, token]);

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
    if (!isAuthenticated || !token) {
      setError('Please log in to add items to your wishlist.');
      clearMessages();
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
    if (!isAuthenticated || !token) {
      setError('Please log in to remove items from your wishlist.');
      clearMessages();
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
