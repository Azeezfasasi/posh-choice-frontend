import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

function QuoteBanner() {
  return (
    <section className="px-4 md:px-6 py-6 md:py-10">
      <div className="relative max-w-7xl mx-auto overflow-hidden rounded-3xl bg-ink px-6 py-10 md:px-12 md:py-14">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 w-80 h-80 rounded-full bg-plum-600/50 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute right-40 -bottom-32 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-3">Bulk &amp; corporate orders</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white leading-tight">
              Buying for an event, office or shop?
            </h2>
            <p className="mt-3 text-white/70 md:text-lg">
              Tell us what you need and we&apos;ll put together a quote with special pricing for your order.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/quoterequest"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink hover:bg-[#d6b25e] transition"
            >
              Request a quote
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/contactus"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default QuoteBanner;
