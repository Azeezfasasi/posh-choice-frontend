import { Link } from 'react-router-dom';
import { useCart } from '../../context-api/cart/UseCart';
import { ArrowRight, Heart, ShoppingBag, X } from 'lucide-react';
import PageHeader from '../PageHeader';
import { formatNaira } from '../../../utils/formatPrice';

const PLACEHOLDER = 'https://placehold.co/400x400/FAF8F5/4A5470?text=Posh+Choice';

// Wishlist items may hold a populated product object or a plain id
const itemProductId = (item) => String(item.productId?._id || item.productId);
const itemSlug = (item) => item.productId?.slug;
const itemPrice = (item) => item.productId?.price ?? item.price;

const WishlistMain = () => {
  const {
    wishlist,
    loading,
    error,
    success,
    removeFromWishlist,
    addToCart,
  } = useCart();

  const items = wishlist?.products || [];

  const handleMoveToCart = async (item) => {
    const added = await addToCart(itemProductId(item), 1);
    if (added) await removeFromWishlist(itemProductId(item));
  };

  if (loading && !wishlist) {
    return (
      <>
        <PageHeader title="Your wishlist" crumbs={[{ label: 'Wishlist' }]} />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" aria-busy="true">
          {[0, 1, 2, 3].map(i => <div key={i} className="aspect-[3/4] rounded-2xl bg-cream animate-pulse" />)}
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Your wishlist" crumbs={[{ label: 'Wishlist' }]} />
        <div className="max-w-xl mx-auto px-4 py-16 md:py-24 text-center">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-plum-50 text-plum-600 mb-5">
            <Heart className="w-8 h-8" strokeWidth={1.75} />
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">Your wishlist is empty</h2>
          <p className="mt-2 text-ink-soft">
            {error ? "We couldn't load your wishlist. Please refresh the page." : 'Tap the heart on any product to save it here for later.'}
          </p>
          <Link to="/app/shop" className="mt-7 inline-flex items-center gap-2 rounded-full bg-plum-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-plum-700 transition">
            Discover products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Your wishlist"
        subtitle={`${items.length} saved item${items.length === 1 ? '' : 's'}`}
        crumbs={[{ label: 'Wishlist' }]}
      />
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div aria-live="polite">
            {success && <p className="mb-5 rounded-xl bg-plum-50 border border-plum-100 px-4 py-3 text-sm text-plum-800">{success}</p>}
            {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}
          </div>
          <ul className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {items.map((item) => {
              const slug = itemSlug(item);
              const href = slug ? `/app/productdetails/slug/${slug}` : '/app/shop';
              return (
                <li key={itemProductId(item)} className="relative flex flex-col bg-white rounded-2xl border border-line overflow-hidden">
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(itemProductId(item))}
                    disabled={loading}
                    className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/95 text-ink shadow hover:text-red-600 transition disabled:opacity-50"
                    aria-label={`Remove ${item.name} from wishlist`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <Link to={href} className="block aspect-square bg-cream overflow-hidden">
                    <img
                      src={item.image || PLACEHOLDER}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-contain p-4"
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER; }}
                    />
                  </Link>
                  <div className="flex flex-col flex-1 p-4">
                    <Link to={href} className="text-sm md:text-[15px] font-medium text-ink leading-snug line-clamp-2 min-h-[2.5rem] hover:text-plum-700 transition">
                      {item.name}
                    </Link>
                    <p className="mt-2 text-base md:text-lg font-bold text-ink">{formatNaira(itemPrice(item))}</p>
                    {item.addedAt && (
                      <p className="text-xs text-ink-soft">
                        Saved {new Date(item.addedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(item)}
                      disabled={loading}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-plum-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-plum-700 transition disabled:opacity-60"
                    >
                      <ShoppingBag className="w-4 h-4" /> Move to cart
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
};

export default WishlistMain;
