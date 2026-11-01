import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, Wallet, MessageCircle } from 'lucide-react';
import cusmetics1 from '../images/cusmetics1.png';
import stainless2 from '../images/stainless2.png';
import fan from '../images/fan.png';

const heroSlides = [
  {
    eyebrow: 'Kitchen & household',
    title: 'Quality essentials for every home',
    subtitle: 'Durable kitchenware and household products, carefully selected and delivered to your door.',
    image: stainless2,
    imageAlt: 'Stainless steel dish rack with plates and cups',
    cta: { label: 'Shop the collection', to: '/app/shop' },
    secondary: { label: 'Request a quote', to: '/quoterequest' },
  },
  {
    eyebrow: 'For businesses & events',
    title: 'Bulk orders, tailored to you',
    subtitle: "Special pricing on large orders for offices, events and resellers. Tell us what you need and we'll send a quote.",
    image: cusmetics1,
    imageAlt: 'Cosmetics organiser filled with skincare products',
    cta: { label: 'Request a quote', to: '/quoterequest' },
    secondary: { label: 'Browse products', to: '/app/shop' },
  },
  {
    eyebrow: 'Gifts & souvenirs',
    title: 'Thoughtful gifts for every occasion',
    subtitle: 'Long-lasting souvenirs and gift items for celebrations, corporate gifting and everyday moments.',
    image: fan,
    imageAlt: 'Portable mini fans in assorted colours',
    cta: { label: 'Browse gift ideas', to: '/app/shop' },
    secondary: { label: 'Request a quote', to: '/quoterequest' },
  },
];

const AUTOPLAY_MS = 6500;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function ProductHero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  const goTo = useCallback((index) => {
    setCurrent((index + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion()) return undefined;
    const timer = setTimeout(() => goTo(current + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [current, paused, goTo]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) goTo(current + (delta < 0 ? 1 : -1));
    touchStartX.current = null;
  };

  const slide = heroSlides[current];

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-plum-900 via-plum-800 to-ink text-white"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Soft decorative glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-plum-500/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-0 w-[32rem] h-[32rem] rounded-full bg-gold/15 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-12 pb-8 md:pt-16 lg:pt-14 lg:pb-6 grid lg:grid-cols-2 items-center gap-10 lg:gap-16">
        {/* Copy */}
        <div key={current} className="animate-hero-fade text-center lg:text-left" aria-live="polite">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            {slide.eyebrow}
          </span>
          <h1 className="font-display mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            {slide.title}
          </h1>
          <p className="mt-5 text-base md:text-lg text-white/75 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {slide.subtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link
              to={slide.cta.to}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-black/20 hover:bg-[#d6b25e] transition"
            >
              {slide.cta.label}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to={slide.secondary.to}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              {slide.secondary.label}
            </Link>
          </div>

          {/* Ways to buy */}
          <ul className="mt-8 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2"><Wallet className="w-4 h-4 text-gold" /> Pay by bank transfer</li>
            <li className="flex items-center gap-2"><Truck className="w-4 h-4 text-gold" /> Order tracking</li>
            <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-gold" /> Order on WhatsApp</li>
          </ul>
        </div>

        {/* Image */}
        <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-[440px]">
          <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] border border-gold/40" />
          <div className="relative aspect-square rounded-[2rem] overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/40 bg-plum-950">
            {heroSlides.map((s, idx) => (
              <img
                key={s.title}
                src={s.image}
                alt={idx === current ? s.imageAlt : ''}
                aria-hidden={idx !== current}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0'}`}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pb-8 md:pb-10 flex items-center justify-center lg:justify-start gap-4">
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 transition"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          {heroSlides.map((s, idx) => (
            <button
              key={s.title}
              type="button"
              onClick={() => goTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'w-8 bg-gold' : 'w-3 bg-white/35 hover:bg-white/60'}`}
              aria-label={`Show slide ${idx + 1}: ${s.title}`}
              aria-current={idx === current}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(current + 1)}
          className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 transition"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

export default ProductHero;
