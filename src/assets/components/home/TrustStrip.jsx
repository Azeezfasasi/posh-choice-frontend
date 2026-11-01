import React from 'react';
import { Wallet, PackageCheck, MapPinned, Headset } from 'lucide-react';

// Everything here reflects what the store actually offers (payment methods, quotes, tracking, 24h support)
const ITEMS = [
  { icon: Wallet, title: 'Flexible payment', text: 'Pay by bank transfer or order on WhatsApp' },
  { icon: PackageCheck, title: 'Bulk & custom orders', text: 'Special pricing for businesses and events' },
  { icon: MapPinned, title: 'Track every order', text: 'Follow your order with your order number' },
  { icon: Headset, title: 'Here 24 hours', text: 'Call or chat with us any time' },
];

function TrustStrip() {
  return (
    <section className="bg-white border-b border-line" aria-label="Why shop with us">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {ITEMS.map(({ icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-plum-50 text-plum-600">
              {React.createElement(icon, { className: 'w-5 h-5', strokeWidth: 1.75 })}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="text-xs md:text-sm text-ink-soft mt-0.5 leading-snug">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustStrip;
