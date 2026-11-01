import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Heart, Menu, ShoppingBag, UserRound, X } from 'lucide-react'
import pclogo3 from '../images/pclogo3.png'
import ProductSearch from './product/ProductSearch';
import { useCart } from '../context-api/cart/UseCart';
import { useUser } from '../context-api/user-context/UseUser';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/app/shop', label: 'Shop' },
  { to: '/aboutus', label: 'About Us' },
  { to: '/app/trackorder', label: 'Track Order' },
  { to: '/app/blog', label: 'Blog' },
  { to: '/contactus', label: 'Contact' },
];

const iconButton = 'relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-ink hover:bg-plum-50 hover:text-plum-700 transition';

function HeaderIcons() {
  const { cart } = useCart();
  const { user } = useUser();
  const itemCount = cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return (
    <>
      <Link to={user ? '/app/dashboard' : '/login'} className={iconButton} aria-label={user ? 'My account' : 'Sign in'}>
        <UserRound className="w-[22px] h-[22px]" strokeWidth={1.75} />
      </Link>
      <Link to="/app/wishlist" className={iconButton} aria-label="Wishlist">
        <Heart className="w-[22px] h-[22px]" strokeWidth={1.75} />
      </Link>
      <Link to="/app/cart" className={iconButton} aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}>
        <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={1.75} />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-plum-600 text-white text-[10px] font-bold leading-[18px] text-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </Link>
    </>
  );
}

function MainHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  const desktopLinkClass = ({ isActive }) =>
    `relative py-2 text-[15px] font-medium transition after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-plum-600 after:transition-all ${
      isActive ? 'text-plum-700 after:w-full' : 'text-ink hover:text-plum-700 after:w-0 hover:after:w-full'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg font-medium ${isActive ? 'bg-plum-50 text-plum-700' : 'text-ink hover:bg-cream'}`;

  return (
    <>
      <header className="bg-white/95 backdrop-blur border-b border-line sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center min-w-0" aria-label="Posh Choice Store home">
            <img
              src={pclogo3}
              alt="Posh Choice"
              className="h-6 sm:h-7 md:h-8 w-auto max-w-full"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
            {NAV_LINKS.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end} className={desktopLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center shrink-0 gap-0.5 sm:gap-1 md:gap-2">
            <HeaderIcons />
            <Link
              to="/app/shop"
              className="hidden lg:inline-flex ml-2 items-center rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-plum-700 transition"
            >
              Shop now
            </Link>
            <button
              className={`${iconButton} lg:hidden`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="lg:hidden border-t border-line bg-white px-4 py-3 shadow-lg" aria-label="Mobile">
            {NAV_LINKS.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end} className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/app/shop"
              onClick={() => setMenuOpen(false)}
              className="mt-2 block text-center rounded-full bg-plum-600 px-5 py-3 font-semibold text-white hover:bg-plum-700 transition"
            >
              Shop now
            </Link>
          </nav>
        )}
      </header>
      <ProductSearch />
    </>
  )
}

export default MainHeader
