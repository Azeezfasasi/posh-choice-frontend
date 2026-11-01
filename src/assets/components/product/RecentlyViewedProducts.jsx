import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../home/SectionHeader';
import ProductCard from './ProductCard';

const arrowButton = 'w-10 h-10 inline-flex items-center justify-center rounded-full border border-line bg-white text-ink hover:bg-plum-50 hover:text-plum-700 hover:border-plum-200 transition';

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';

const RecentlyViewedProducts = () => {
  const [products, setProducts] = useState([]);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    // Get recently viewed products from localStorage
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure unique products and limit to 10
        const uniqueProducts = Array.from(new Map(parsed.map(product => [product._id || product.slug, product])).values());
        setProducts(uniqueProducts.slice(0, 10));
      } catch (error) {
        console.error("Failed to parse recently viewed products from localStorage:", error);
        setProducts([]);
      }
    }
  }, []);

  // Arrow navigation
  const handleScroll = useCallback((direction) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth * 0.6; // Scroll by 60% of the container width
      sliderRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  const handlePrev = () => handleScroll('prev');
  const handleNext = () => handleScroll('next');

  // Drag functionality
  const onMouseDown = useCallback((e) => {
    isDragging.current = true;
    if (sliderRef.current) {
      sliderRef.current.classList.add('dragging');
      startX.current = e.pageX - sliderRef.current.offsetLeft;
      scrollLeft.current = sliderRef.current.scrollLeft;
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    if (isDragging.current && sliderRef.current) {
      isDragging.current = false;
      sliderRef.current.classList.remove('dragging');
    }
  }, []);

  const onMouseUp = useCallback(() => {
    if (isDragging.current && sliderRef.current) {
      isDragging.current = false;
      sliderRef.current.classList.remove('dragging');
    }
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Increased sensitivity for a snappier drag
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  // Touch events for mobile

  if (!products.length) return null;

  return (
    <section className="bg-white border-t border-line">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <SectionHeader eyebrow="Pick up where you left off" title="Recently viewed">
          <button onClick={handlePrev} className={arrowButton} aria-label="Previous" type="button">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleNext} className={arrowButton} aria-label="Next" type="button">
            <ChevronRight className="w-5 h-5" />
          </button>
        </SectionHeader>
        <div
          ref={sliderRef}
          className="flex gap-3 md:gap-5 overflow-x-auto no-scrollbar cursor-grab select-none scroll-smooth"
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {products.map((product, idx) => (
            <div className="w-[46%] sm:w-[31%] lg:w-[19%] shrink-0" key={product._id || idx}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedProducts;