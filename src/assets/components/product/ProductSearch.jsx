import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../../config/api';

function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/products`, {
          params: { search: query, limit: 20 },
        });
        setResults(res.data.data || res.data);
        setError('');
      } catch (err) {
        console.error('Search error:', err);
        if (err.response && err.response.data) {
          setError(err.response.data.error || 'Failed to fetch products.');
        } else {
          setError('Failed to fetch products.');
        }
        setResults([]);
      }
      setLoading(false);
    }, 400); // 400ms debounce
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-2 px-2 md:px-0">
      <form onSubmit={e => e.preventDefault()} className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for products..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-purple-500 text-white font-semibold rounded-r-md hover:bg-purple-600 transition"
          disabled
        >
          Search
        </button>
      </form>
      {/* Conditional rendering for results, loading, error states */}
      {(loading || error || (results.length > 0 && query.trim())) && (
        <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
          {loading && <div className="text-center py-4 text-purple-500">Searching...</div>}
          {error && <div className="text-center text-red-600 py-2">{error}</div>}
          {results.length > 0 && query.trim() && (
            <div className="grid grid-cols-1 gap-2 p-2">
              {results.map(product => (
                <Link
                  to={`/app/productdetails/slug/${product.slug || product._id}`}
                  key={product._id}
                  className="flex items-center gap-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition p-3 border border-gray-100"
                  onClick={() => setResults([])}
                >
                  <img
                    src={product.thumbnail || (product.images && product.images[0]?.url) || '/placehold.co/400x400/CCCCCC/000000?text=No+Image'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded border border-gray-100"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 truncate">{product.name}</div>
                    <div className="text-purple-500 font-bold text-base">₦{product.salePrice || product.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {results.length === 0 && query.trim() && !loading && !error && (
            <div className="text-center text-gray-500 py-4">No products found.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductSearch;