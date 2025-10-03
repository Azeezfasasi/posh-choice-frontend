import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { Link, useParams } from 'react-router-dom';

function ProductsByCategoryMain() {
  const { slug } = useParams();

  // Fetch category by slug
  const { data: category, isLoading: loadingCategory, isError: errorCategory, error: categoryError } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/categories/slug/${slug}`);
      return res.data;
    },
    enabled: !!slug,
  });

  // Fetch products for the selected category (after category is loaded)
  const { data: products, isLoading: loadingProducts, isError: errorProducts, error: productsError } = useQuery({
    queryKey: ['products-by-category', category?._id],
    enabled: !!category?._id,
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/products?category=${category._id}`);
      return res.data.data || res.data;
    },
  });

  return (
    <>
    <div className="font-sans antialiased bg-white p-6 md:p-10 lg:p-12">
      {loadingCategory && <div className="text-center py-8">Loading category...</div>}
      {errorCategory && <div className="text-center text-red-600 py-8">{categoryError?.message || 'Failed to load category.'}</div>}
      {category && (
        <>
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            Products in {category.name}
          </h2>
          {loadingProducts && <div className="text-center py-8">Loading products...</div>}
          {errorProducts && <div className="text-center text-red-600 py-8">{productsError?.message || 'Failed to load products.'}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products && products.map((product) => (
              <Link to={`/app/productdetails/slug/${product.slug}`}
                key={product._id}
                className="bg-gray-50 rounded-xl shadow-sm overflow-hidden p-4 flex flex-col items-center text-center border border-gray-200 hover:shadow-md transition-shadow duration-300"
              >
                <img
                  src={product.thumbnail || (product.images && product.images[0]?.url) || 'https://placehold.co/150x200/E0F2F7/2C3E50?text=No+Image'}
                  alt={product.name}
                  className="w-32 h-40 object-contain mb-4 rounded-lg"
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/150x200/E0F2F7/2C3E50?text=Product';
                  }}
                />
                <h3 className="text-base font-medium text-gray-800 mb-2">{product.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-lg font-bold text-gray-900 mr-2">
                    ₦{product.salePrice?.toLocaleString() || product.price?.toLocaleString()}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="text-sm text-gray-500 line-through">
                      ₦{product.price?.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.discountPercentage > 0 && (
                  <p className="text-xs text-green-600 font-semibold">
                    Save - ₦{(product.price - product.salePrice).toLocaleString()}
                  </p>
                )}
              </Link>
            ))}
          </div>
          {products && products.length === 0 && !loadingProducts && !errorProducts && (
            <div className="text-center text-gray-500 py-8">No products found in this category.</div>
          )}
        </>
      )}
    </div>
    </>
  );
}

export default ProductsByCategoryMain;
