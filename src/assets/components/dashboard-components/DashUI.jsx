import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Shared building blocks for dashboard screens

export function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-line bg-white ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-5 md:px-6 pt-5">
          <div>
            {title && <h2 className="font-sans text-base font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="text-sm text-ink-soft mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

export function CardLink({ to, children }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-1 text-sm font-semibold text-plum-700 hover:text-plum-800 whitespace-nowrap">
      {children} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function StatTile({ label, value, hint, icon, to, loading }) {
  const Icon = icon;
  const body = (
    <div className="h-full rounded-2xl border border-line bg-white p-5 transition group-hover:border-plum-200 group-hover:shadow-[0_12px_32px_-18px_rgba(15,27,61,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        {Icon && (
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-plum-50 text-plum-600">
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-24 rounded-lg bg-cream animate-pulse" />
      ) : (
        <p className="mt-2 text-2xl md:text-[28px] font-bold text-ink tracking-tight">{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
  return to ? <Link to={to} className="group block h-full">{body}</Link> : <div className="h-full">{body}</div>;
}

// Status colours always come with the status text, never colour alone
const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  Processing: 'bg-sky-50 text-sky-800 ring-sky-200',
  Shipped: 'bg-plum-50 text-plum-800 ring-plum-200',
  Delivered: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 ring-red-200',
  Refunded: 'bg-slate-100 text-slate-700 ring-slate-200',
  Paid: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  'Not Paid': 'bg-amber-50 text-amber-800 ring-amber-200',
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 ring-slate-200';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {status}
    </span>
  );
}

export function EmptyNote({ children }) {
  return <p className="py-6 text-center text-sm text-ink-soft">{children}</p>;
}
