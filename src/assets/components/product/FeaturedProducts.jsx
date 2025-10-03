import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProduct } from '../../assets/context-api/product-context/UseProduct';
import { FaStar, FaShoppingCart } from 'react-icons/fa';

const FeaturedProducts = () => {
  const { 
    featuredProducts, 
    loading, 
    error, 
    fetchFeaturedProducts,
    formatPrice,
    calculateSalePrice
  } = useProduct();

  useEffect(() => {
    fetchFeaturedProducts(4);  // Fetch 4 featured products
  }, [fetchFeaturedProducts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return null;  // Don't show any error in featured section
  }

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;  // Don't show section if no featured products
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Featured Products</h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Discover our handpicked selection of premium products
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
          {featuredProducts.map((product) => (
            <div key={product._id} className="group relative">
              <div className="w-full bg-gray-200 rounded-lg overflow-hidden aspect-w-1 aspect-h-1">
                {/* <Link to={`/product/${product.slug}`}>
                  {product.featuredImage ? (
                    <img
                      src={product.featuredImage.startsWith('http') 
                        ? product.featuredImage 
                        : `${process.env.REACT_APP_API_URL}${product.featuredImage}`}
                      alt={product.name}
                      className="w-full h-full object-center object-cover group-hover:opacity-75 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      No image
                    </div>
                  )}
                </Link> */}
                
                {product.isOnSale && (
                  <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-br">
                    SALE
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    <Link to={`/product/${product.slug}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.category?.name}
                  </p>
                  
                  {/* Rating stars */}
                  {product.rating > 0 && (
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < Math.floor(product.rating) 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <p className="ml-1 text-xs text-gray-500">
                        ({product.numReviews})
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  {product.isOnSale ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(calculateSalePrice(product.price, product.discountPercentage))}
                      </p>
                      <p className="text-xs text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-center bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  <FaShoppingCart className="mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-block bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;