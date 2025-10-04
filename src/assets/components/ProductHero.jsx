import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cusmetics1 from '../images/cusmetics1.png';
import stainless2 from '../images/stainless2.png';
import fan from '../images/fan.png';

const heroSlides = [
  {
    title: 'Discover Quality Household Products for Every Need',
    subtitle: 'Shop the best deals on household, industrial, and custom souvenir items. Fast delivery, top brands, and unbeatable prices!',
    image: stainless2,
    cta: 'Shop Now',
    link: '/app/shop',
  },
  {
    title: 'Bulk Orders & Custom Solutions',
    subtitle: 'Get special pricing and tailored solutions for your business or event. Contact us for a quote!',
    image: cusmetics1,
    cta: 'Request Quote',
    link: '/quoterequest',
  },
  {
    title: 'Durable Souvenir Products for Home & Business',
    subtitle: 'Explore our range of sustainable, long-lasting souvenir products for every application.',
    image: fan,
    cta: 'Browse Products',
    link: '/app/shop',
  },
];

function ProductHero() {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [deltaX, setDeltaX] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Pointer (mouse/touch) handlers for drag/swipe
  const onPointerDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || (e.touches && e.touches[0].clientX) || 0);
    setDeltaX(0);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    setDeltaX(currentX - startX);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 70; // px to consider a swipe
    if (deltaX > threshold) {
      // swipe right -> previous
      setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    } else if (deltaX < -threshold) {
      // swipe left -> next
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }
    setDeltaX(0);
  };

  const slide = heroSlides[current];

  return (
    <section
      className="relative bg-gradient-to-br from-gray-500 to-black py-16 md:py-24 lg:py-32 flex flex-col items-center justify-center text-center overflow-hidden min-h-[420px]"
      onMouseDown={onPointerDown}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onMouseLeave={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
      role="region"
      aria-label="Featured products slider"
      style={{ touchAction: 'pan-y' }}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover object-center opacity-40  z-0 transition-all duration-700"
        style={{ pointerEvents: 'none' }}
      />
      <div className="max-w-3xl mx-auto z-10 relative">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
          {slide.title}
        </h1>
        <p className="text-lg md:text-2xl text-white mb-8 font-medium drop-shadow">
          {slide.subtitle}
        </p>
        <Link
          to={slide.link}
          className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold text-lg px-8 py-3 rounded-full shadow transition duration-200"
        >
          {slide.cta}
        </Link>
      </div>
      {/* Slider controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full border-2 border-purple-400 bg-white transition-all duration-200 ${current === idx ? 'bg-blue-600 border-blue-600' : ''}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      {/* Decorative shapes */}
      <div className="absolute left-0 top-0 w-40 h-40 bg-blue-100 rounded-full opacity-30 -z-1 animate-pulse" style={{ filter: 'blur(12px)' }} />
      <div className="absolute right-0 bottom-0 w-56 h-56 bg-purple-200 rounded-full opacity-20 -z-1 animate-pulse" style={{ filter: 'blur(18px)' }} />
    </section>
  );
}

export default ProductHero;