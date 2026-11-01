import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { formatNaira } from '../../../utils/formatPrice';

const PLACEHOLDER = 'https://placehold.co/400x400/FAF8F5/4A5470?text=Posh+Choice';

const getImage = (product) =>
  product.thumbnail && !product.thumbnail.startsWith('/placehold')
    ? product.thumbnail
    : (product.images && product.images[0]?.url) || PLACEHOLDER;

// Shared storefront product card used across the landing page
function ProductCard({ product }) {
  const onSale = product.onSale || product.discountPercentage > 0;
  const price = onSale && product.salePrice != null ? product.salePrice : product.price;

  return (
    <Link
      to={`/app/productdetails/slug/${product.slug || product._id}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-line overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(15,27,61,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-plum-500"
    >
      <div className="relative aspect-square bg-cream overflow-hidden">
        <img
          src={getImage(product)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
        {product.discountPercentage > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-plum-600 px-2.5 py-1 text-[11px] font-semibold text-white">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        {product.category?.name && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-1 truncate">
            {product.category.name}
          </p>
        )}
        <h3 className="text-sm md:text-[15px] font-medium text-ink leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base md:text-lg font-bold text-ink">{formatNaira(price)}</span>
            {onSale && product.price > price && (
              <span className="text-xs text-ink-soft line-through">{formatNaira(product.price)}</span>
            )}
          </div>
          {product.rating > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
