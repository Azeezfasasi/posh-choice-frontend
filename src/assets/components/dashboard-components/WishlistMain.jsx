import { Link } from 'react-router-dom';
import { useCart } from '../../context-api/cart/UseCart';
import { FaHeart, FaSadTear, FaSpinner, FaShoppingCart } from 'react-icons/fa';

const WishlistMain = () => {
  const {
    wishlist,
    loading,
    error,
    success,
    removeFromWishlist,
    addToCart,
    formatPrice,
  } = useCart();

  const handleRemoveFromWishlist = (productId) => {
    // Add a confirmation dialog for better UX
    if (window.confirm('Are you sure you want to remove this item from your wishlist?')) {
        removeFromWishlist(productId);
    }
  };

  const handleMoveToCart = async (productId, quantity = 1) => {
    // Add a confirmation dialog if needed, or just proceed directly
    const successAdd = await addToCart(productId, quantity);
    if (successAdd) {
      if (window.confirm('Item added to cart. Do you want to remove it from your wishlist?')) {
         await removeFromWishlist(productId);
      }
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] bg-gray-50 p-6 rounded-lg shadow-md">
        <FaSpinner className="animate-spin text-blue-500 text-4xl mr-3" />
        <p className="text-xl text-gray-700">Loading your wishlist...</p>
      </div>
    );
  }

  // Render error message
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative min-h-[50vh] flex items-center justify-center text-center">
        <strong className="font-bold mr-2">Error!</strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Render empty wishlist state
  if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white p-8 rounded-lg shadow-xl text-gray-700">
        <FaSadTear className="text-purple-500 text-6xl mb-6" />
        <h2 className="text-3xl font-bold mb-3">Your Wishlist is Empty</h2>
        <p className="text-lg text-center mb-6">
          Start adding your favorite products to save them for later!
        </p>
        <Link
          to="/app/shop"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          Discover Products
        </Link>
      </div>
    );
  }

  // Render wishlist content
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Your Wishlist</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Saved for Later</h2>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto"> {/* Hide on small screens, show on md and up */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added On</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wishlist.products.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                          <img
                            className="h-full w-full object-cover"
                            src={item.image || '/placehold.co/100x100/CCCCCC/000000?text=No+Image'}
                            alt={item.name}
                          />
                        </div>
                        <div className="ml-4">
                          <Link to={`/app/productdetails/${item.productId}`} className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline">
                            {item.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(item.addedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleMoveToCart(item.productId)}
                          className="text-green-600 hover:text-green-900 transition duration-150 ease-in-out p-2 rounded-full hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-1"
                          title="Move to Cart"
                        >
                          <FaShoppingCart className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.productId)}
                          className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                          title="Remove from Wishlist"
                        >
                          <FaHeart className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden"> {/* Show on small screens, hide on md and up */}
            {wishlist.products.map((item) => (
              <div key={item.productId} className="border border-gray-200 rounded-lg shadow-sm p-4 mb-4 bg-white">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden border border-gray-200">
                    <img
                      className="h-full w-full object-cover"
                      src={item.image || '/placehold.co/100x100/CCCCCC/000000?text=No+Image'}
                      alt={item.name}
                    />
                  </div>
                  <div className="flex-grow">
                    <Link to={`/app/productdetails/slug/${item.productId}`} className="text-base font-medium text-blue-600 hover:text-blue-800 hover:underline">
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-700 mt-1">Price: {formatPrice(item.price)}</p>
                    <p className="text-xs text-gray-500">Added: {new Date(item.addedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-3 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => handleMoveToCart(item.productId)}
                    className="flex-1 text-green-600 hover:text-green-900 transition duration-150 ease-in-out px-3 py-2 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center gap-Cart1 text-sm"
                    title="Move to "
                  >
                    <FaShoppingCart /> Move to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                    className="flex-1 text-red-600 hover:text-red-900 transition duration-150 ease-in-out px-3 py-2 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center gap-1 text-sm"
                    title="Remove from Wishlist"
                  >
                    <FaHeart /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default WishlistMain;
