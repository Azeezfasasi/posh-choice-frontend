import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';
import { formatNaira } from '../../../utils/formatPrice';

function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const debounceRef = useRef();
  const containerRef = useRef(null);

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

  // Close the results when clicking outside or pressing Escape
  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  const showPanel = open && query.trim();

  return (
    <div className="bg-white border-b border-line">
      <div ref={containerRef} className="relative max-w-3xl mx-auto px-4 py-3">
        <form onSubmit={e => e.preventDefault()} role="search">
          <label htmlFor="site-search" className="sr-only">Search for products</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft pointer-events-none" />
            <input
              id="site-search"
              type="search"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setOpen(true)}
              onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }}
              placeholder="Search for products"
              autoComplete="off"
              className="w-full h-12 pl-12 pr-4 rounded-full bg-cream border border-line text-[15px] text-ink placeholder:text-ink-soft/80 focus:outline-none focus:bg-white focus:border-plum-400 focus:ring-4 focus:ring-plum-100 transition"
            />
          </div>
        </form>

        {showPanel && (
          <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl border border-line shadow-[0_16px_40px_-12px_rgba(15,27,61,0.25)] z-50 overflow-hidden max-h-96 overflow-y-auto">
            {loading && <div className="text-center py-5 text-sm text-ink-soft">Searching...</div>}
            {error && <div className="text-center text-sm text-red-600 py-4">{error}</div>}
            {!loading && results.length > 0 && (
              <ul className="divide-y divide-line">
                {results.map(product => (
                  <li key={product._id}>
                    <Link
                      to={`/app/productdetails/slug/${product.slug || product._id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-cream transition"
                      onClick={() => { setOpen(false); setResults([]); }}
                    >
                      <img
                        src={product.thumbnail || (product.images && product.images[0]?.url) || 'https://placehold.co/96x96/FAF8F5/4A5470?text=PC'}
                        alt=""
                        className="w-12 h-12 object-contain rounded-lg bg-cream border border-line"
                      />
                      <span className="flex-1 min-w-0 text-sm font-medium text-ink truncate">{product.name}</span>
                      <span className="text-sm font-semibold text-plum-700">{formatNaira(product.onSale ? product.salePrice : product.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {results.length === 0 && !loading && !error && (
              <div className="text-center text-sm text-ink-soft py-5">No products found for "{query.trim()}".</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductSearch;
