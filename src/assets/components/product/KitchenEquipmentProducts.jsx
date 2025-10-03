import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { Link } from 'react-router-dom';

const KitchenEquipmentProducts = () => {
  // Fetch the 'chairs' category first
  const { data: kitchenEquipmentsCategory, isLoading: loadingCategory, isError: errorCategory, error: categoryError } = useQuery({
    queryKey: ['category', 'kitchen-equipments'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/categories/slug/kitchen-equipments`);
      return res.data;
    },
  });

  // Fetch products for the 'chairs' category
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products-kitchen-equipments', kitchenEquipmentsCategory?._id],
    enabled: !!kitchenEquipmentsCategory?._id,
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/products?category=${kitchenEquipmentsCategory._id}&limit=5`);
      return res.data.data || res.data;
    },
  });

  const products = data || [];

  return (
    <div className="font-sans antialiased bg-white p-6 md:p-10 lg:p-12">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-purple-500 border-b-2 border-purple-500 pb-1">
          Kitchen Equipments
        </h2>
        <Link to="/app/shop" className="text-purple-500 hover:underline text-sm md:text-base flex items-center">
          View All
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Loading/Error states */}
      {(loadingCategory || isLoading) && <div className="text-center py-8">Loading products...</div>}
      {(errorCategory || isError) && <div className="text-center text-red-600 py-8">{categoryError?.message || error?.message || 'Failed to load products.'}</div>}

      {/* Deals section - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="relative bg-gray-50 rounded-xl shadow-sm overflow-hidden p-4 flex flex-col items-center text-center border border-gray-200 hover:shadow-md transition-shadow duration-300"
          >
            {/* Discount badge */}
            {product.discountPercentage > 0 && (
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                {product.discountPercentage}% OFF
              </div>
            )}

            {/* Product Image */}
            <Link to={`/app/productdetails/slug/${product.slug}`} className="mb-4">
              <img
                src={product.thumbnail || (product.images && product.images[0]?.url) || 'https://placehold.co/150x200/E0F2F7/2C3E50?text=No+Image'}
                alt={product.name}
                className="w-32 h-40 object-contain mb-4 rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/150x200/E0F2F7/2C3E50?text=${product.name?.split(' ')[0] || 'Product'}`;
                }}
              />
            </Link>

            {/* Product Name */}
            <h3 className="text-sm md:text-base font-medium text-gray-800 mb-2">
              {product.name}
            </h3>

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

export default KitchenEquipmentProducts;
