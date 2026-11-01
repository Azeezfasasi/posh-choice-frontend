import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';
import { ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';
import PageHeader from '../PageHeader';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './CategoryProductRow';

const PAGE_SIZE = 12;

// Values match the backend's sortBy options, so sorting covers the whole catalogue, not just one page
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'priceAsc', label: 'Price: low to high' },
  { value: 'priceDesc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'nameAsc', label: 'Name: A to Z' },
];

const chipClass = (active) =>
  `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
    active ? 'border-plum-600 bg-plum-600 text-white' : 'border-line bg-white text-ink hover:border-plum-300 hover:text-plum-700'
  }`;

const pageButton = 'inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-full text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed';

// Page numbers with ellipses: 1 … 4 5 6 … 12
function pageList(current, total) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('…');
    result.push(p);
  });
  return result;
}

const ProductListForCustomers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);
  const sortBy = SORT_OPTIONS.some(o => o.value === searchParams.get('sort')) ? searchParams.get('sort') : 'newest';
  const category = searchParams.get('category') || '';

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const { data: categories = [], isSuccess: categoriesLoaded } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      return res.data.data || res.data;
    },
  });

  const activeCategory = categories.find(c => c.slug === category);
  const categoryMissing = Boolean(category) && categoriesLoaded && !activeCategory;

  // The URL keeps the readable slug; the API gets the category id (works on old and new backends)
  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ['shop-products', page, sortBy, activeCategory?._id || ''],
    enabled: !category || Boolean(activeCategory),
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/products`, {
        params: { page, limit: PAGE_SIZE, sortBy, category: activeCategory?._id },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const products = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalProducts = data?.totalProducts || 0;

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateParams({ page: newPage === 1 ? '' : newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageHeader
        title={activeCategory ? activeCategory.name : 'Shop all products'}
        subtitle={activeCategory?.description || 'Household essentials, kitchenware, gift items and souvenirs, all in one place.'}
        crumbs={activeCategory ? [{ label: 'Shop', to: '/app/shop' }, { label: activeCategory.name }] : [{ label: 'Shop' }]}
      />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
          {/* Toolbar: categories + sort */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible" role="group" aria-label="Filter by category">
              <button type="button" className={chipClass(!category)} onClick={() => updateParams({ category: '', page: '' })}>
                All
              </button>
              {categories.filter(c => c.isActive !== false).map(cat => (
                <button
                  key={cat._id}
                  type="button"
                  className={chipClass(category === cat.slug)}
                  onClick={() => updateParams({ category: cat.slug, page: '' })}
                  aria-pressed={category === cat.slug}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-sm text-ink-soft" aria-live="polite">
                {isPending && !categoryMissing ? 'Loading…' : `${totalProducts} product${totalProducts === 1 ? '' : 's'}`}
              </p>
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <span className="hidden sm:inline">Sort by</span>
                <select
                  value={sortBy}
                  onChange={e => updateParams({ sort: e.target.value === 'newest' ? '' : e.target.value, page: '' })}
                  className="h-10 rounded-full border border-line bg-white pl-4 pr-9 text-sm font-medium text-ink focus:outline-none focus:border-plum-400 focus:ring-4 focus:ring-plum-100"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          {/* Results */}
          {categoryMissing ? (
            <EmptyState
              title="Category not found"
              text="This category doesn't exist or is no longer available."
              action={{ label: 'View all products', onClick: () => updateParams({ category: '', page: '' }) }}
            />
          ) : isPending ? (
            <ProductGridSkeleton count={8} />
          ) : isError ? (
            <EmptyState title="We couldn't load products" text="Please check your connection and try again." />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              text={activeCategory ? `There are no products in ${activeCategory.name} yet.` : 'There are no products available at the moment.'}
              action={category ? { label: 'View all products', onClick: () => updateParams({ category: '', page: '' }) } : null}
            />
          ) : (
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
              {products.map(product => <ProductCard key={product._id} product={product} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !isPending && !categoryMissing && (
            <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className={`${pageButton} border border-line text-ink hover:bg-cream`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {pageList(page, totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`gap-${i}`} className="px-1 text-ink-soft">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={`${pageButton} ${p === page ? 'bg-plum-600 text-white' : 'text-ink hover:bg-cream'}`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className={`${pageButton} border border-line text-ink hover:bg-cream`}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
};

function EmptyState({ title, text, action }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4 rounded-2xl border border-dashed border-line bg-cream">
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-plum-50 text-plum-600 mb-4">
        <PackageSearch className="w-7 h-7" strokeWidth={1.75} />
      </span>
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink-soft max-w-sm">{text}</p>
      {action && (
        <button type="button" onClick={action.onClick} className="mt-5 rounded-full bg-plum-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-plum-700 transition">
          {action.label}
        </button>
      )}
    </div>
  );
}

export default ProductListForCustomers;
