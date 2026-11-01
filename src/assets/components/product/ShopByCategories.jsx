import React, { useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../home/SectionHeader';

const CATEGORY_PLACEHOLDER = 'https://placehold.co/160x160/F6F1FA/5B2A86?text=Posh';
const arrowButton = 'w-10 h-10 inline-flex items-center justify-center rounded-full border border-line bg-white text-ink hover:bg-plum-50 hover:text-plum-700 hover:border-plum-200 transition';

function ShopByCategories() {
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Fetch categories from backend
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      return res.data.data || res.data;
    },
  });

  const categories = (data || []).filter(cat => cat.isActive !== false);

  // --- Slider Navigation and Drag Logic ---

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

  // --- End Slider Logic ---

  // Hide the section on the landing page if categories can't be loaded
  if (isError || (!isLoading && categories.length === 0)) return null;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <SectionHeader eyebrow="Browse" title="Shop by category">
          <button onClick={handlePrev} className={arrowButton} aria-label="Previous categories" type="button">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleNext} className={arrowButton} aria-label="Next categories" type="button">
            <ChevronRight className="w-5 h-5" />
          </button>
        </SectionHeader>

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-36 shrink-0">
                <div className="w-28 h-28 rounded-full bg-cream animate-pulse" />
                <div className="h-3 w-20 rounded bg-cream animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar cursor-grab select-none scroll-smooth"
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
          >
            {categories.map((cat) => (
              <Link
                to={`/app/shop?category=${cat.slug}`}
                key={cat._id}
                className="group flex flex-col items-center w-32 md:w-40 shrink-0 py-2 text-center focus:outline-none"
                draggable={false}
              >
                <span className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-cream p-1.5 ring-1 ring-line transition group-hover:ring-2 group-hover:ring-plum-300 group-focus-visible:ring-2 group-focus-visible:ring-plum-500">
                  <img
                    src={cat.image || CATEGORY_PLACEHOLDER}
                    alt=""
                    draggable={false}
                    className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = CATEGORY_PLACEHOLDER;
                    }}
                  />
                </span>
                <span className="mt-3 text-sm font-semibold text-ink group-hover:text-plum-700 transition line-clamp-2">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ShopByCategories;