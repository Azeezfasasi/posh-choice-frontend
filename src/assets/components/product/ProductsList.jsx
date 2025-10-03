import React, { useState, useMemo } from 'react';
import ProductFilter from './ProductFilter';

const ProductsList = ({ products }) => {
  const [filter, setFilter] = useState('recent');

  // Memoize sorted/filtered products
  const filteredProducts = useMemo(() => {
    let sorted = [...products];
    switch (filter) {
      case 'low-to-high':
        sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'high-to-low':
        sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'discount':
        sorted.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
        break;
      case 'popular':
        sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    return sorted;
  }, [products, filter]);

  return (
    <div>
      <ProductFilter filter={filter} setFilter={setFilter} />
      {/* Render filteredProducts here */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredProducts.map(product => (
          <div key={product._id} className="relative bg-gray-50 rounded-xl shadow-sm overflow-hidden p-4 flex flex-col items-center text-center border border-gray-200 hover:shadow-md transition-shadow duration-300">
            {/* Discount badge */}
            {product.discountPercentage > 0 && (
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                {product.discountPercentage}% OFF
              </div>
            )}
            {/* Product Image */}
            <img
              src={product.thumbnail || (product.images && product.images[0]?.url) || 'https://placehold.co/150x200/E0F2F7/2C3E50?text=No+Image'}
              alt={product.name}
              className="w-32 h-40 object-contain mb-4 rounded-lg"
              onError={e => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/150x200/E0F2F7/2C3E50?text=${product.name?.split(' ')[0] || 'Product'}`;
              }}
            />
            {/* Product Name */}
            <h3 className="text-sm md:text-base font-medium text-gray-800 mb-2">{product.name}</h3>
            {/* Prices */}
            <div className="flex items-baseline mb-2">
              <span className="text-lg md:text-xl font-bold text-gray-900 mr-2">
                ₦{product.salePrice?.toLocaleString() || product.price?.toLocaleString()}
              </span>
              {product.discountPercentage > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  ₦{product.price?.toLocaleString()}
                </span>
              )}
            </div>
            {/* Save amount */}
            {product.discountPercentage > 0 && (
              <p className="text-xs text-green-600 font-semibold">
                Save - ₦{(product.price - product.salePrice).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;
