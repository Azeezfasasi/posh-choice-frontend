import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, ChevronDown, ExternalLink, FilePlus2, FileText, FolderPlus, Heart, KeyRound, LayoutDashboard, ListTree, LogOut,
  Mail, MapPinned, Menu, MessageSquareQuote, Package, PackagePlus, ReceiptText, Send, ShoppingBag, Truck, UserPlus, UserRound, Users, X,
} from 'lucide-react';
import { useUser } from '../../context-api/user-context/UseUser';

// Sidebar structure. `admin: true` sections/items are only shown to admins and super admins.
const NAV = [
  {
    label: 'Overview',
    items: [{ to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Store',
    admin: true,
    items: [
      { to: '/app/adminorderlist', label: 'Orders', icon: ReceiptText, match: ['/app/vieworderdetails'] },
      { to: '/app/products', label: 'Products', icon: Package, match: ['/app/editproduct'] },
      { to: '/app/addproduct', label: 'Add product', icon: PackagePlus },
      { to: '/app/productcategories', label: 'Categories', icon: ListTree, match: ['/app/editproductcategories'] },
      { to: '/app/addproductcategory', label: 'Add category', icon: FolderPlus },
      { to: '/app/delivery-location', label: 'Delivery locations', icon: Truck },
    ],
  },
  {
    label: 'Customers',
    admin: true,
    items: [
      { to: '/app/quote', label: 'Quote requests', icon: MessageSquareQuote },
      { to: '/app/allusers', label: 'Users', icon: Users },
      { to: '/app/addnewuser', label: 'Add user', icon: UserPlus },
      { to: '/app/changeuserpassword', label: 'Reset password', icon: KeyRound },
    ],
  },
  {
    label: 'Content',
    admin: true,
    items: [
      { to: '/app/blogposts', label: 'Blog posts', icon: FileText, match: ['/app/editblogpost'] },
      { to: '/app/addnewpost', label: 'New post', icon: FilePlus2 },
      { to: '/app/sendnewsletter', label: 'Send newsletter', icon: Send },
      { to: '/app/allnewsletter', label: 'Newsletters', icon: BookOpen },
      { to: '/app/Newslettersubscribers', label: 'Subscribers', icon: Mail },
    ],
  },
  {
    label: 'Shopping',
    customer: true,
    items: [
      { to: '/app/userorderdetails', label: 'My orders', icon: ShoppingBag, match: ['/app/viewuserorderdetails'] },
      { to: '/app/wishlist', label: 'Wishlist', icon: Heart },
      { to: '/app/trackorder', label: 'Track an order', icon: MapPinned },
    ],
  },
  {
    label: 'Account',
    items: [{ to: '/app/profile', label: 'My profile', icon: UserRound, match: ['/app/mysettings'] }],
  },
];

const roleLabel = (role) => (role ? role.replace(/\b\w/g, c => c.toUpperCase()) : '');

function SidebarNav({ isAdmin, onNavigate }) {
  const { pathname } = useLocation();
  const sections = NAV.filter(s => (!s.admin || isAdmin) && (!s.customer || !isAdmin));

  return (
    <nav aria-label="Dashboard" className="dark-scroll flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {sections.map(section => (
        <div key={section.label}>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">{section.label}</p>
          <ul className="space-y-0.5">
            {section.items.map(item => {
              const Icon = item.icon;
              const extraMatch = item.match?.some(prefix => pathname.toLowerCase().startsWith(prefix.toLowerCase()));
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end
                    onClick={onNavigate}
                    className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive || extraMatch ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition ${
                          isActive || extraMatch ? 'bg-plum-600 text-white' : 'bg-white/5 text-white/70 group-hover:text-white'
                        }`}>
                          <Icon className="w-4 h-4" strokeWidth={1.9} />
                        </span>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Sidebar({ isAdmin, onNavigate, onLogout }) {
  return (
    <div className="flex flex-col h-full bg-ink text-white">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2 px-6 h-16 border-b border-white/10 shrink-0">
        <span className="font-display text-xl font-semibold tracking-tight">Posh Choice<span className="text-gold">.</span></span>
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-soft">
          {isAdmin ? 'Admin' : 'Account'}
        </span>
      </Link>
      <SidebarNav isAdmin={isAdmin} onNavigate={onNavigate} />
      <div className="px-3 py-4 border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5"><LogOut className="w-4 h-4" /></span>
          Sign out
        </button>
      </div>
    </div>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-full pl-1 pr-2 py-1 hover:bg-cream transition"
      >
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-plum-600 text-white text-sm font-semibold">{initial}</span>
        <span className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-semibold text-ink max-w-[10rem] truncate">{user?.name || 'Account'}</span>
          <span className="text-xs text-ink-soft">{roleLabel(user?.role)}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-ink-soft" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-white py-2 shadow-[0_16px_40px_-12px_rgba(15,27,61,0.25)] z-50">
          <div className="px-4 py-2 border-b border-line mb-1">
            <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
            <p className="text-xs text-ink-soft truncate">{user?.email}</p>
          </div>
          <Link role="menuitem" to="/app/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-cream">
            <UserRound className="w-4 h-4 text-ink-soft" /> My profile
          </Link>
          <Link role="menuitem" to="/" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-cream">
            <ExternalLink className="w-4 h-4 text-ink-soft" /> View store
          </Link>
          <button role="menuitem" type="button" onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Shell for every dashboard page: dark sidebar, top bar with page title, cream content area.
 * @param {{ title: string, subtitle?: string, actions?: any, children: any }} props
 */
function DashboardLayout({ title, subtitle, actions, children }) {
  const { user, logout, isAdmin } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the mobile drawer on navigation and with Escape
  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cream print:bg-white">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block print:!hidden fixed inset-y-0 left-0 w-64 z-40">
        <Sidebar isAdmin={isAdmin} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Dashboard menu">
          <button type="button" className="absolute inset-0 bg-ink/50 backdrop-blur-sm" aria-label="Close menu" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <Sidebar isAdmin={isAdmin} onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} />
            <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close menu"
              className="absolute top-3 -right-12 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-ink shadow">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-64 print:!pl-0 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="print:hidden sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-line">
          <div className="h-full px-4 md:px-8 flex items-center gap-3">
            <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open menu"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-ink hover:bg-cream">
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-lg md:text-xl font-semibold text-ink truncate">{title}</h1>
              {subtitle && <p className="hidden md:block text-xs text-ink-soft truncate">{subtitle}</p>}
            </div>
            <Link to="/" className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-cream transition">
              <ExternalLink className="w-4 h-4" /> View store
            </Link>
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8">
          {actions && <div className="mb-6 flex flex-wrap items-center justify-end gap-3">{actions}</div>}
          <div className="dash-content max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
