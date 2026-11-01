import { useState } from 'react';
import { Eye, EyeOff, PackageCheck, Heart, MapPinned } from 'lucide-react';
import TopHeader from './TopHeader';
import MainHeader from './MainHeader';
import Footer from './Footer';

const BENEFITS = [
  { icon: MapPinned, text: 'Track your orders in one place' },
  { icon: Heart, text: 'Save favourites to your wishlist' },
  { icon: PackageCheck, text: 'Faster checkout next time' },
];

// Shared layout for sign-in / sign-up pages: brand panel on large screens, form card on the right
function AuthLayout({ title, subtitle, children }) {
  return (
    <>
      <TopHeader />
      <MainHeader />
      <main className="bg-cream">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16 grid lg:grid-cols-2 gap-10 items-stretch">
          <aside className="hidden lg:flex relative overflow-hidden rounded-3xl bg-gradient-to-br from-plum-800 via-plum-900 to-ink p-10 text-white flex-col justify-between">
            <div aria-hidden="true" className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Posh Choice Store</p>
              <h2 className="font-display mt-4 text-4xl font-semibold leading-tight">Quality essentials, chosen with care.</h2>
              <p className="mt-4 text-white/70">Kitchenware, household essentials, gifts and souvenirs, for your home, business or next event.</p>
            </div>
            <ul className="relative space-y-4">
              {BENEFITS.map(({ icon, text }) => {
                const Icon = icon;
                return (
                  <li key={text} className="flex items-center gap-3 text-white/85">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-gold">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </span>
                    {text}
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="w-full max-w-md mx-auto lg:max-w-none rounded-3xl bg-white border border-line p-6 sm:p-10 shadow-[0_12px_40px_-20px_rgba(15,27,61,0.25)]">
            <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
            {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const inputClass = 'w-full h-12 px-4 rounded-xl border border-line bg-white text-ink placeholder:text-ink-soft/70 focus:outline-none focus:border-plum-400 focus:ring-4 focus:ring-plum-100 transition';

export function AuthField({ label, id, hint, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <input id={id} className={inputClass} {...inputProps} />
      {hint && <p className="mt-1.5 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

export function PasswordField({ label, id, hint, labelAction, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label>
        {labelAction}
      </div>
      <div className="relative">
        <input id={id} type={visible ? 'text' : 'password'} className={`${inputClass} pr-12`} {...inputProps} />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-full text-ink-soft hover:text-ink hover:bg-cream transition"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

export const authButtonClass = 'w-full h-12 rounded-full bg-plum-600 text-white font-semibold hover:bg-plum-700 transition disabled:opacity-60';

export default AuthLayout;
