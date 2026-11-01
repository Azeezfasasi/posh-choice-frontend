import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Title band for storefront pages: breadcrumb, serif title and optional subtitle.
 * Without a title it renders a slim breadcrumb bar (e.g. product pages, which have their own heading).
 * @param {{ title: string, subtitle?: string, crumbs?: Array<{label: string, to?: string}>, children?: any }} props
 */
function PageHeader({ title, subtitle, crumbs = [], children }) {
  const trail = [{ label: 'Home', to: '/' }, ...crumbs];
  return (
    <div className="bg-cream border-b border-line">
      <div className={`max-w-7xl mx-auto px-4 md:px-6 ${title ? 'py-8 md:py-10' : 'py-4'}`}>
        <nav aria-label="Breadcrumb" className={title ? 'mb-3' : ''}>
          <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-soft">
            {trail.map((crumb, i) => (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-ink-soft/60" aria-hidden="true" />}
                {crumb.to && i < trail.length - 1 ? (
                  <Link to={crumb.to} className="hover:text-plum-700 transition">{crumb.label}</Link>
                ) : (
                  <span aria-current={i === trail.length - 1 ? 'page' : undefined} className="text-ink font-medium truncate max-w-[16rem]">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {title && <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight">{title}</h1>
            {subtitle && <p className="mt-2 text-sm md:text-base text-ink-soft max-w-2xl">{subtitle}</p>}
          </div>
          {children}
        </div>}
      </div>
    </div>
  );
}

export default PageHeader;
