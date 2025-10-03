import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import plasticbg1 from '../images/product-image/plasticbg1.jpg';
import plasticbg2 from '../images/product-image/plasticbg2.png';
import plasticbg3 from '../images/product-image/plasticbg3.jpg';

const heroSlides = [
  {
    title: 'Discover Quality Survenir Products for Every Need',
    subtitle: 'Shop the best deals on household, industrial, and custom survenir items. Fast delivery, top brands, and unbeatable prices!',
    image: plasticbg1,
    cta: 'Shop Now',
    link: '/app/shop',
  },
  {
    title: 'Bulk Orders & Custom Solutions',
    subtitle: 'Get special pricing and tailored solutions for your business or event. Contact us for a quote!',
    image: plasticbg3,
    cta: 'Request Quote',
    link: '/quoterequest',
  },
  {
    title: 'Durable Survenir Products for Home & Business',
    subtitle: 'Explore our range of sustainable, long-lasting survenir products for every application.',
    image: plasticbg2,
    cta: 'Browse Products',
    link: '/app/shop',
  },
];

function ProductHero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const slide = heroSlides[current];

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-black py-16 md:py-24 lg:py-32 flex flex-col items-center justify-center text-center overflow-hidden min-h-[420px]">
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