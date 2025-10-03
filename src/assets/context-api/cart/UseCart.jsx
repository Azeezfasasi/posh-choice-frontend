import { useContext } from 'react';
import { CartContext } from './CartContext';

// Custom hook to consume the CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
