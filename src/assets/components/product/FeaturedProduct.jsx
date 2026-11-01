import { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';
import SectionHeader from '../home/SectionHeader';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './CategoryProductRow';

// Custom arrow components for react-slick (slick passes className/style/onClick)
const arrowClass = '!flex !items-center !justify-center !w-11 !h-11 !rounded-full !bg-white !border !border-line !shadow-md !text-ink hover:!bg-plum-50 hover:!text-plum-700 !z-10 before:!content-none';

function NextArrow({ className, style, onClick }) {
  return (
    <button type="button" aria-label="Next products" onClick={onClick} style={style}
      className={`${className} ${arrowClass} !right-1 md:!-right-5`}>
      <ChevronRight className="w-5 h-5" />
    </button>
  );
}
function PrevArrow({ className, style, onClick }) {
  return (
    <button type="button" aria-label="Previous products" onClick={onClick} style={style}
      className={`${className} ${arrowClass} !left-1 md:!-left-5`}>
      <ChevronLeft className="w-5 h-5" />
    </button>
  );
}

const FeaturedProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/products/featured?limit=10`);
        setProducts(res.data);
      } catch {
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const settings = {
    dots: false,
    infinite: products.length > 4,
    speed: 500,
    slidesToShow: Math.min(4, products.length),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(3, products.length) } },
      { breakpoint: 768, settings: { slidesToShow: Math.min(2, products.length) } },
    ]
  };

  // Hide the section rather than showing an error/empty state on the landing page
  if (error || (!loading && !products.length)) return null;

  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <SectionHeader eyebrow="Handpicked" title="Featured products" linkTo="/app/shop" />
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="-mx-2">
            <Slider {...settings}>
              {products.map(product => (
                <div key={product._id} className="px-2 py-2 h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProduct;
