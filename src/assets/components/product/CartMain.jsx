// frontend/src/components/cart/Cart.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context-api/cart/UseCart';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart, FaSpinner, FaSadTear } from 'react-icons/fa';

const CartMain = () => {
  // Destructure values and functions from the CartContext
  const {
    cart,
    loading,
    error,
    success,
    // fetchCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    formatPrice,
    // calculateSalePrice
  } = useCart();

  // Calculate cart subtotal whenever cart items change
  const cartSubtotal = cart?.items?.reduce((total, item) => {
    // Ensure item.price is treated as a number
    const itemPrice = parseFloat(item.price);
    return total + (itemPrice * item.quantity);
  }, 0) || 0;

  // Handle quantity change from input field
  const handleQuantityInputChange = (productId, event) => {
    const newQuantity = parseInt(event.target.value, 10);
    // Only update if it's a valid number and greater than 0
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  // Handle quantity increase/decrease buttons
  const handleQuantityButtonClick = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeCartItem(itemId);
  };

  const handleClearCart = () => {
    // Add a confirmation dialog for clearing the entire cart for better UX
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
    }
  };

  // const handleGoToCheckout = () => {
  //   Navigate('/app/checkout');
  //   addToCart(product._id, quantity);
  // };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] bg-gray-50 p-6 rounded-lg shadow-md">
        <FaSpinner className="animate-spin text-purple-500 text-4xl mr-3" />
        <p className="text-xl text-gray-700">Loading your cart...</p>
      </div>
    );
  }

  // Render error message
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative min-h-[50vh] flex items-center justify-center">
        <strong className="font-bold mr-2">Error!</strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Render empty cart state
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[80vh] bg-white p-8 rounded-lg shadow-xl text-gray-700">
        <FaShoppingCart className="text-blue-500 text-6xl mb-6" />
        <h2 className="text-3xl font-bold mb-3">Your Cart is Empty</h2>
        <p className="text-lg text-center mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          to="/app/shop"
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          Start Shopping!
        </Link>
      </div>
    );
  }

  // Render cart content
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Your Shopping Cart</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="lg:w-2/3 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Items in Your Cart</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:block">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <tr key={item.productId} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrapx">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                            <img
                              className="h-full w-full object-cover"
                              src={item.image || '/placehold.co/100x100/CCCCCC/000000?text=No+Image'}
                              alt={item.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-purple-500">
                               {item.name}
                            </div>
                          </div>
                        </div>
                        {/* Quantity and action buttons */}
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden mt-[20px] w-fit">
                          <div className='font-semibold'>Quantity: </div>
                          <button
                            onClick={() => handleQuantityButtonClick(item.productId, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                            className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <FaMinus className="text-gray-600 text-sm" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityInputChange(item.productId, e)}
                            className="w-16 text-center border-none focus:ring-0 text-sm text-gray-900"
                            min="1"
                            max={item.stockQuantity} // Assuming stockQuantity is available through populate
                          />
                          <button
                            onClick={() => handleQuantityButtonClick(item.productId, item.quantity, 1)}
                            // Assuming product.stockQuantity is populated in item.productId
                            disabled={item.quantity >= (item.productId?.stockQuantity || 999)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <FaPlus className="text-gray-600 text-sm" />
                          </button>
                        </div>

                        {/* Price and Sub Total */}
                        <div className='flex flex-col mt-[20px] md:hidden'>
                            <span>
                                <span className='font-semibold text-[16px]'>PRICE:</span> 
                                <br />
                                <div className='text-[16px]'>{formatPrice(item.price)}</div>
                            </span>
                            <span className='mt-[30px]'>
                                <span className='font-bold text-[18px]'>SUB TOTAL:</span> 
                                <br />
                                <div className='text-[18px]'>{formatPrice(item.price * item.quantity)}</div>
                            </span>
                        </div>

                        {/* delete cart item button */}
                        <div className='mt-[20px]'>
                            <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="flex flex-row items-center justify-start gap-1 bg-red-50 text-red-600 hover:text-red-900 transition duration-150 ease-in-out p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Remove item"
                            >
                            Remove <FaTrash className="text-lg" />
                            </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:block">
                        <div className='flex flex-col'>
                            <span>{formatPrice(item.price)}</span>
                            <span className='mt-[30px]'>
                                <span className='font-bold text-[18px]'>SUB TOTAL:</span> 
                                <br />
                                <div className='text-[18px]'>{formatPrice(item.price * item.quantity)}</div>
                            </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {cart.items.length > 0 && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleClearCart}
                  className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center gap-2 hover:bg-purple-500 hover:text-white cursor-pointer"
                >
                  <FaTrash /> Clear Cart
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:w-1/3 bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cart Summary</h2>
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between text-lg text-gray-700 mb-2">
                <span>Items:</span>
                <span className="font-medium">{cart.items.length}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Cart Total:</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">Shipping and taxes calculated at checkout.</p>
          </div>
          <Link
            to="/app/checkout"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md text-center transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <FaShoppingCart /> Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartMain;
