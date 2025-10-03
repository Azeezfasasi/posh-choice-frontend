import React, { useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { Link } from 'react-router-dom';

function ShopByCategories() {
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Fetch categories from backend
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      return res.data.data || res.data;
    },
  });

  const categories = data || [];

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

  // Touch events for mobile
  const onTouchStart = useCallback((e) => {
    isDragging.current = true;
    if (sliderRef.current) {
      sliderRef.current.classList.add('dragging');
      startX.current = e.touches[0].pageX - sliderRef.current.offsetLeft;
      scrollLeft.current = sliderRef.current.scrollLeft;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (isDragging.current && sliderRef.current) {
      isDragging.current = false;
      sliderRef.current.classList.remove('dragging');
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!isDragging.current || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Increased sensitivity
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  // --- End Slider Logic ---

  return (
    <div className="font-sans antialiased bg-white p-6 md:p-10 lg:p-12 relative overflow-hidden"> {/* Added relative and overflow-hidden */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-purple-500 border-b-2 border-purple-500 pb-1">
          Shop by Categories
        </h2>
        {/* Arrow Navigation Buttons */}
        {!isLoading && categories.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-orange-100 transition border border-orange-200 shadow"
              aria-label="Previous category"
              type="button"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-orange-100 transition border border-orange-200 shadow"
              aria-label="Next category"
              type="button"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isLoading && <div className="text-center py-8">Loading categories...</div>}
      {isError && <div className="text-center text-red-600 py-8">{error?.message || 'Failed to load categories.'}</div>}

      {/* Slider Container */}
      {!isLoading && !isError && categories.length > 0 && (
        <div className="overflow-hidden w-full relative"> {/* This div hides overflowing content */}
          <div
            ref={sliderRef}
            className="flex whitespace-nowrap overflow-x-hidden no-scrollbar cursor-grab select-none" // Added no-scrollbar, cursor-grab, select-none
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchMove={onTouchMove}
          >
            {categories.map((cat) => (
              <Link
                to={`/app/productsbycategory/slug/${cat.slug}`}
                key={cat._id}
                className="min-w-[150px] sm:min-w-[180px] lg:min-w-[200px] flex-shrink-0 bg-gray-50 rounded-xl shadow-sm overflow-hidden p-4 flex flex-col items-center text-center border border-gray-200 hover:shadow-md transition-shadow duration-300 cursor-pointer focus:outline-none mx-2" // Added inline-block, flex-shrink-0, and margin
                style={{ textDecoration: 'none' }}
              >
                <img
                  src={cat.image || 'https://placehold.co/120x120/E0F2F7/2C3E50?text=Category'}
                  alt={cat.name}
                  className="w-24 h-24 object-cover mb-3 rounded-full border border-blue-100"
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/120x120/E0F2F7/2C3E50?text=Category';
                  }}
                />
                <h3 className="text-base font-medium text-gray-800 mb-1 truncate">{cat.name}</h3> {/* Added truncate */}
                {cat.description && <p className="text-xs text-gray-500 truncate">{cat.description}</p>} {/* Added truncate */}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopByCategories;