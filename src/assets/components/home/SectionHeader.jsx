import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Consistent heading for landing-page sections: small gold eyebrow, serif title, optional "View all" link
function SectionHeader({ eyebrow, title, linkTo, linkLabel = 'View all', children }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-2">{eyebrow}</p>
        )}
        <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-ink leading-tight">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {children}
        {linkTo && (
          <Link
            to={linkTo}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-plum-600 hover:text-plum-800 transition"
          >
            {linkLabel}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default SectionHeader;
