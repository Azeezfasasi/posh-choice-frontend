import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import SectionHeader from '../home/SectionHeader';
import ProductCard from './ProductCard';

// A landing-page row of products from one category, looked up by its slug.
// Renders nothing if the category doesn't exist or has no products.
function CategoryProductRow({ slug, title, eyebrow, limit = 5, tone = 'white' }) {
  const { data: category } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/categories/slug/${slug}`);
      return res.data;
    },
    retry: false,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products-by-category', category?._id, limit],
    enabled: !!category?._id,
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/products`, { params: { category: category._id, limit } });
      return res.data.data || res.data;
    },
  });

  if (!category || (!isLoading && products.length === 0)) return null;

  return (
    <section className={tone === 'cream' ? 'bg-cream' : 'bg-white'}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <SectionHeader
          eyebrow={eyebrow}
          title={title || category.name}
          linkTo={`/app/shop?category=${slug}`}
        />
        {isLoading ? (
          <ProductGridSkeleton count={limit} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
            {products.map(product => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </div>
    </section>
  );
}

export function ProductGridSkeleton({ count = 5 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-line overflow-hidden bg-white">
          <div className="aspect-square bg-cream animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-3 w-3/4 rounded bg-cream animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-cream animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategoryProductRow;
