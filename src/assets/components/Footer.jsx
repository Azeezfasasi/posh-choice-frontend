import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import SubscribeToNewsletter from './SubscribeToNewsletter'

const SHOP_LINKS = [
  { to: '/app/shop', label: 'All products' },
  { to: '/app/trackorder', label: 'Track your order' },
  { to: '/app/cart', label: 'Cart' },
  { to: '/app/wishlist', label: 'Wishlist' },
];

const COMPANY_LINKS = [
  { to: '/aboutus', label: 'About us' },
  { to: '/app/blog', label: 'Blog' },
  { to: '/contactus', label: 'Contact us' },
  { to: '/quoterequest', label: 'Request a quote' },
];

function FooterLinks({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {links.map(link => (
          <li key={link.to}>
            <Link to={link.to} className="text-sm text-white/70 hover:text-white transition">{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-14 pb-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.6fr]">
        {/* Brand & contact */}
        <div>
          <Link to="/" className="inline-block font-display text-2xl font-semibold tracking-tight">
            Posh Choice<span className="text-gold">.</span>
          </Link>
          <p className="mt-3 text-sm text-white/65 leading-relaxed max-w-xs">
            Quality household essentials, kitchenware, gift items and souvenirs, for homes, businesses and events.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm">
            <li>
              <a href="tel:+2348157574797" className="flex items-center gap-2.5 text-white/80 hover:text-white transition">
                <Phone className="w-4 h-4 text-gold" /> (+234) 08157574797
              </a>
            </li>
            <li>
              <a href="mailto:info@poshchoicestore.com.ng" className="flex items-center gap-2.5 text-white/80 hover:text-white transition break-all">
                <Mail className="w-4 h-4 text-gold shrink-0" /> info@poshchoicestore.com.ng
              </a>
            </li>
            <li className="flex items-center gap-2.5 text-white/80">
              <MapPin className="w-4 h-4 text-gold" /> Ikotun, Lagos
            </li>
          </ul>
        </div>

        <FooterLinks title="Shop" links={SHOP_LINKS} />
        <FooterLinks title="Company" links={COMPANY_LINKS} />

        {/* Newsletter */}
        <SubscribeToNewsletter />
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/55">
          <p>&copy; {new Date().getFullYear()} Posh Choice Store. All rights reserved.</p>
          <p>
            Developed and maintained by{' '}
            <a href="https://wa.me/8117256648" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition">Sense Solutions</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
