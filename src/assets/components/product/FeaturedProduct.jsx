import { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { API_BASE_URL } from '../../../config/api';
import { Link } from 'react-router-dom';

// Custom arrow components for react-slick
function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <button
      className={
        className +
        ' !flex !items-center !justify-center !bg-white !shadow-lg !rounded-full !w-10 !h-10 !absolute !-right-5 !top-1/2 !-translate-y-1/2 hover:!bg-gray-200 z-10'
      }
      style={{ ...style, display: 'block' }}
      onClick={onClick}
      aria-label="Next"
      type="button"
    >
      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
    </button>
  );
}
function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <button
      className={
        className +
        ' !flex !items-center !justify-center !bg-white !shadow-lg !rounded-full !w-10 !h-10 !absolute !-left-5 !top-1/2 !-translate-y-1/2 hover:!bg-gray-200 z-10'
      }
      style={{ ...style, display: 'block' }}
      onClick={onClick}
      aria-label="Previous"
      type="button"
    >
      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
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
    dots: true,
    infinite: products.length > 4,
    speed: 500,
    slidesToShow: Math.min(4, products.length),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  if (loading) return <div className="text-center py-8 text-gray-500 text-lg">Loading featured products...</div>;
  if (error) return <div className="text-center py-8 text-red-500 text-lg">{error}</div>;
  if (!products.length) return <div className="text-center py-8 text-gray-400 text-lg">No featured products found.</div>;

  return (
    <section className="py-10 bg-gray-50 overflow-x-hidden">
      <div className="flex justify-between items-center mb-6 md:mb-8 px-[20px] md:px-[40px]">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-purple-500 border-b-2 border-purple-500 pb-1">
          Featured Products
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

      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <Slider {...settings}>
          {products.map(product => (
            <div key={product._id} className="px-2 py-6">
              <Link to={`/app/productdetails/slug/${product.slug || product._id}`} className="block group">
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 flex flex-col items-center p-4 min-h-[350px] group-hover:ring-2 group-hover:ring-primary-500">
                  <div className="w-full h-44 flex items-center justify-center mb-4 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={product.thumbnail || (product.images && product.images[0]?.url) || '/placehold.co/400x400/CCCCCC/000000?text=No+Image'}
                      alt={product.name}
                      className="object-contain max-h-40 max-w-full"
                    />
                  </div>
                  <div className="w-full text-center">
                    <h3 className="text-lg font-semibold text-gray-700 mb-1 truncate">{product.name}</h3>
                    <div className="mb-2">
                      {product.onSale ? (
                        <>
                          <span className="text-xl font-bold text-purple-500 mr-2">₦{product.salePrice?.toFixed(2)}</span>
                          <span className="text-base line-through text-gray-400">₦{product.price?.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-gray-800">₦{product.price?.toFixed(2)}</span>
                      )}
                    </div>
                    {product.rating > 0 && (
                      <div className="flex items-center justify-center gap-1 text-yellow-500 text-base">
                        <span>⭐</span>
                        <span>{product.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default FeaturedProduct;
