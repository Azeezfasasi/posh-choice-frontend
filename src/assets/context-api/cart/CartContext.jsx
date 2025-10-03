// frontend/src/context-api/cart-context/CartContext.js
import { createContext } from 'react';

// Create a context for the cart and wishlist
// It will hold the cart and wishlist state, along with functions to modify them.
export const CartContext = createContext({
  cart: null, // User's current cart object
  wishlist: null, // User's current wishlist object
  loading: false, // Loading state for API calls
  error: null,    // Error message if an API call fails
  success: null,  // Success message after an API call
  
  // Cart actions
  fetchCart: () => {},
  addToCart: () => {},
  updateCartItemQuantity: () => {},
  removeCartItem: () => {},
  clearCart: () => {},

  // Wishlist actions
  fetchWishlist: () => {},
  addToWishlist: () => {},
  removeFromWishlist: () => {},

  // Utility functions (optional, but often helpful here)
  formatPrice: (price) => `$${price.toFixed(2)}`,
  calculateSalePrice: (originalPrice, discountPercentage) => {
    if (discountPercentage && originalPrice) {
      return originalPrice * (1 - discountPercentage / 100);
    }
    return originalPrice;
  },
});
