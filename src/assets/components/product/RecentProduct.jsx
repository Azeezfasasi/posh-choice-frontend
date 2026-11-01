import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import SectionHeader from '../home/SectionHeader';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './CategoryProductRow';

const RecentProduct = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recent-products'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/products`, { params: { limit: 10, sortBy: 'newest' } });
      return res.data.data || res.data;
    },
  });

  const products = data || [];
  if (isError || (!isLoading && products.length === 0)) return null;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <SectionHeader eyebrow="Just in" title="New arrivals" linkTo="/app/shop" linkLabel="Shop all" />
        {isLoading ? (
          <ProductGridSkeleton count={10} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
            {products.map(product => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentProduct;
