import { useEffect, useState, useContext } from 'react';
import { API_ORIGIN } from '../../../config/api';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ProductContext } from '../../context-api/product-context/ProductContext';
import { UserContext } from '../../context-api/user-context/UserContext';
import { useCart } from '../../context-api/cart/UseCart';
import { Check, Expand, Heart, Loader2, Minus, PackageX, Plus, ShieldCheck, ShoppingBag, Star, Truck, Wallet } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import PageHeader from '../PageHeader';
import { formatNaira } from '../../../utils/formatPrice';

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const PLACEHOLDER = 'https://placehold.co/800x800/FAF8F5/4A5470?text=Posh+Choice';
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '2348157574797';

function addToRecentlyViewed(product) {
  if (!product) return;
  let viewed = [];
  try {
    viewed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || [];
  } catch {
    viewed = [];
  }
  viewed = viewed.filter(p => p._id !== product._id);
  viewed.unshift(product);
  try {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(viewed.slice(0, 10)));
  } catch {
    // storage full or unavailable; recently viewed is optional
  }
}

const imageUrl = (url) => (url ? (url.startsWith('http') ? url : `${API_ORIGIN}${url}`) : PLACEHOLDER);

// Wishlist items may hold a populated product object or a plain id
const wishlistItemId = (item) => String(item.productId?._id || item.productId);

function Stars({ rating, size = 'w-4 h-4' }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={`${size} ${rating >= n - 0.25 ? 'fill-gold text-gold' : rating >= n - 0.75 ? 'fill-gold/50 text-gold' : 'text-line fill-line'}`} />
      ))}
    </span>
  );
}

const ProductDetailsMain = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    product,
    loading: productLoading,
    error: productError,
    fetchProductBySlug,
    addProductReview,
  } = useContext(ProductContext);

  const { user } = useContext(UserContext);

  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    wishlist,
    loading: cartLoading,
    error: cartError,
    success: cartSuccess,
  } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (product) addToRecentlyViewed(product);
  }, [product]);

  // Auto-hide notification
  useEffect(() => {
    if (cartSuccess || cartError) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [cartSuccess, cartError]);

  useEffect(() => {
    fetchProductBySlug(slug);
  }, [slug, fetchProductBySlug]);

  // Reset selected image and quantity when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
    }
  }, [product]);

  const maxQuantity = product?.stockQuantity || 1;

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= maxQuantity) setQuantity(value);
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData({ ...reviewData, [name]: name === 'rating' ? parseInt(value, 10) : value });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewData.comment.trim()) {
      setReviewError('Please write a short review before submitting.');
      return;
    }
    setReviewError('');
    await addProductReview(product._id, reviewData);
    setReviewData({ rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  const handleAddToCart = async () => {
    if (!product || product.stockQuantity === 0) return;
    await addToCart(
      product._id,
      quantity,
      product.slug,
      product.name,
      product.images && product.images[0] ? product.images[0].url : '',
      product.price
    );
  };

  const isInWishlist = Boolean(product && wishlist?.products?.some(item => wishlistItemId(item) === String(product._id)));

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isInWishlist) await removeFromWishlist(product._id);
    else await addToWishlist(product._id);
  };

  if (productLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid md:grid-cols-2 gap-10" aria-busy="true" aria-label="Loading product">
        <div className="aspect-square rounded-3xl bg-cream animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 w-1/4 rounded bg-cream animate-pulse" />
          <div className="h-9 w-3/4 rounded bg-cream animate-pulse" />
          <div className="h-7 w-1/3 rounded bg-cream animate-pulse" />
          <div className="h-24 w-full rounded bg-cream animate-pulse" />
          <div className="h-12 w-full rounded-full bg-cream animate-pulse" />
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-plum-50 text-plum-600 mb-4">
          <PackageX className="w-7 h-7" strokeWidth={1.75} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-ink">Product not found</h1>
        <p className="mt-2 text-ink-soft">The product you're looking for doesn't exist or is no longer available.</p>
        <Link to="/app/shop" className="mt-6 inline-flex rounded-full bg-plum-600 px-6 py-3 text-sm font-semibold text-white hover:bg-plum-700 transition">
          Browse all products
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [{ url: product.thumbnail }];
  const onSale = product.onSale || product.discountPercentage > 0;
  const unitPrice = onSale && product.salePrice != null ? product.salePrice : product.price;
  const inStock = product.stockQuantity > 0;
  const lowStock = inStock && product.stockQuantity <= 5;

  const productUrl = `${window.location.origin}/app/productdetails/slug/${product.slug}`;
  const whatsappText = [
    'Hello Posh Choice, I would like to order:',
    '',
    `Product: ${product.name}`,
    `Quantity: ${quantity}`,
    `Unit price: ${formatNaira(unitPrice)}`,
    `Total: ${formatNaira(unitPrice * quantity)}`,
    '',
    `Link: ${productUrl}`,
    user?.email ? `Email: ${user.email}` : '',
  ].filter((line, i, all) => line !== '' || (i > 0 && all[i - 1] !== '')).join('\n');
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;

  const details = [
    product.brand && ['Brand', product.brand],
    // Hide auto-generated SKUs (long machine ids); show human-entered ones
    product.sku && product.sku.length <= 20 && ['SKU', product.sku],
    product.weight != null && product.weight !== 0 && ['Weight', `${product.weight} kg`],
    product.category?.name && ['Category', product.category.name],
  ].filter(Boolean);

  return (
    <>
      <Helmet>
        <title>{`${product.name} | Posh Choice Store`}</title>
      </Helmet>
      <PageHeader
        crumbs={[
          { label: 'Shop', to: '/app/shop' },
          ...(product.category?.slug ? [{ label: product.category.name, to: `/app/shop?category=${product.category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      {/* Toast */}
      {showNotification && (cartSuccess || cartError) && (
        <div
          role="status"
          className={`fixed top-24 right-4 z-[60] flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-lg ${cartSuccess ? 'bg-ink text-white' : 'bg-red-600 text-white'}`}
        >
          {cartSuccess && <Check className="w-4 h-4 text-gold" />}
          {cartSuccess || cartError}
        </div>
      )}

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 grid md:grid-cols-2 gap-8 lg:gap-14">
          {/* Gallery */}
          <div className="min-w-0 md:sticky md:top-28 self-start">
            <div className="relative aspect-square rounded-3xl bg-cream border border-line overflow-hidden">
              <button type="button" onClick={() => setLightboxOpen(true)} className="block w-full h-full" aria-label="View image full screen">
                <img
                  src={imageUrl(images[selectedImage]?.url)}
                  alt={product.name}
                  className="w-full h-full object-contain p-6"
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER; }}
                />
              </button>
              <span className="pointer-events-none absolute top-4 right-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-ink shadow">
                <Expand className="w-4 h-4" />
              </span>
              {product.discountPercentage > 0 && (
                <span className="absolute top-4 left-4 rounded-full bg-plum-600 px-3 py-1 text-xs font-semibold text-white">
                  -{Math.round(product.discountPercentage)}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
                {images.map((image, index) => (
                  <button
                    key={image.url || index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={selectedImage === index}
                    className={`shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-cream overflow-hidden border-2 transition ${selectedImage === index ? 'border-plum-600' : 'border-transparent hover:border-plum-200'}`}
                  >
                    <img src={imageUrl(image.url)} alt="" className="w-full h-full object-contain p-1.5" />
                  </button>
                ))}
              </div>
            )}
            {lightboxOpen && (
              <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={images.map(img => ({ src: imageUrl(img.url) }))}
                index={selectedImage}
                on={{ view: ({ index }) => setSelectedImage(index) }}
              />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0">
            {product.category?.name && (
              <Link to={`/app/shop?category=${product.category.slug}`} className="text-xs font-semibold uppercase tracking-[0.16em] text-gold hover:text-plum-700 transition">
                {product.category.name}
              </Link>
            )}
            <h1 className="font-display mt-2 text-3xl lg:text-4xl font-semibold text-ink leading-tight">{product.name}</h1>

            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-plum-700">
              <Stars rating={product.rating || 0} />
              <span>{product.numReviews || 0} {product.numReviews === 1 ? 'review' : 'reviews'}</span>
            </a>

            <div className="mt-6 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-ink">{formatNaira(unitPrice)}</span>
              {onSale && product.price > unitPrice && (
                <>
                  <span className="text-lg text-ink-soft line-through">{formatNaira(product.price)}</span>
                  <span className="rounded-full bg-plum-50 px-2.5 py-1 text-xs font-semibold text-plum-700">
                    You save {formatNaira(product.price - unitPrice)}
                  </span>
                </>
              )}
            </div>

            <p className="mt-3 text-sm font-medium">
              {inStock ? (
                <span className={lowStock ? 'text-amber-700' : 'text-emerald-700'}>
                  {lowStock ? `Only ${product.stockQuantity} left in stock` : 'In stock'}
                </span>
              ) : (
                <span className="text-red-600">Out of stock</span>
              )}
            </p>

            {(product.colors?.length > 0 || product.sizes?.length > 0) && (
              <div className="mt-6 space-y-4">
                {product.colors?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-ink mb-2">Available colours</p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map(color => (
                        <span key={color} className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-ink">
                          <span className="w-4 h-4 rounded-full border border-line" style={{ backgroundColor: color.toLowerCase() }} />
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.sizes?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-ink mb-2">Available sizes</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(size => (
                        <span key={size} className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ink">{size}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Purchase */}
            <div className="mt-8 rounded-3xl border border-line bg-cream p-5 md:p-6">
              {inStock ? (
                <>
                  <div className="flex items-center gap-3">
                    <label htmlFor="quantity" className="text-sm font-semibold text-ink">Quantity</label>
                    <div className="inline-flex items-center rounded-full border border-line bg-white">
                      <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-full text-ink hover:bg-cream disabled:opacity-40" aria-label="Decrease quantity">
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        max={maxQuantity}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-12 text-center bg-transparent text-ink font-semibold focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button type="button" onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))} disabled={quantity >= maxQuantity}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-full text-ink hover:bg-cream disabled:opacity-40" aria-label="Increase quantity">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={cartLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-plum-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-60 transition"
                    >
                      {cartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                      {cartLoading ? 'Adding…' : 'Add to cart'}
                    </button>
                    <WishlistButton active={isInWishlist} disabled={cartLoading} onClick={handleToggleWishlist} />
                  </div>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366] bg-white px-6 py-3.5 text-sm font-semibold text-[#128C4A] hover:bg-[#25D366]/10 transition"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.174.2-.298.3-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.2 5.077 4.366.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.617h-.001a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.455 4.436-9.89 9.893-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.896 6.994c-.003 5.456-4.438 9.891-9.893 9.891m8.413-18.306A11.815 11.815 0 0 0 12.05 0C5.495 0 .06 5.435.058 12.09c0 2.13.557 4.213 1.615 6.044L0 24l6.064-1.591a11.888 11.888 0 0 0 5.983 1.527h.005c6.555 0 11.89-5.435 11.893-12.09a11.86 11.86 0 0 0-3.487-8.484"/></svg>
                    Order on WhatsApp
                  </a>
                </>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">Currently out of stock</p>
                    <p className="text-sm text-ink-soft">Save it to your wishlist, or ask us when it'll be back.</p>
                  </div>
                  <WishlistButton active={isInWishlist} disabled={cartLoading} onClick={handleToggleWishlist} />
                </div>
              )}
            </div>

            <ul className="mt-6 grid sm:grid-cols-3 gap-3 text-sm text-ink-soft">
              <li className="flex items-center gap-2"><Wallet className="w-4 h-4 text-plum-600" /> Bank transfer or WhatsApp</li>
              <li className="flex items-center gap-2"><Truck className="w-4 h-4 text-plum-600" /> Track your order</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-plum-600" /> Quality checked</li>
            </ul>

            {details.length > 0 && (
              <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
                {details.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-3">
                    <dt className="text-ink-soft">{label}</dt>
                    <dd className="font-medium text-ink text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {product.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-cream border border-line px-3 py-1 text-xs text-ink-soft">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-cream border-t border-line">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink mb-6">Product details</h2>
          <div className="rich-text">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
            ) : (
              <p>No description available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="bg-white border-t border-line scroll-mt-28">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">Customer reviews</h2>
              <div className="mt-2 flex items-center gap-3 text-sm text-ink-soft">
                <Stars rating={product.rating || 0} size="w-5 h-5" />
                <span>
                  {product.numReviews > 0 ? `${(product.rating || 0).toFixed(1)} out of 5 · ${product.numReviews} ${product.numReviews === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}
                </span>
              </div>
            </div>
            {!showReviewForm && (
              user ? (
                <button type="button" onClick={() => setShowReviewForm(true)} className="rounded-full border border-plum-600 px-5 py-2.5 text-sm font-semibold text-plum-700 hover:bg-plum-50 transition">
                  Write a review
                </button>
              ) : (
                <Link to="/login" className="rounded-full border border-plum-600 px-5 py-2.5 text-sm font-semibold text-plum-700 hover:bg-plum-50 transition text-center">
                  Sign in to write a review
                </Link>
              )
            )}
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-10 rounded-3xl border border-line bg-cream p-5 md:p-6 space-y-4">
              <h3 className="font-semibold text-ink">Write a review</h3>
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-ink mb-1.5">Rating</label>
                <select id="rating" name="rating" value={reviewData.rating} onChange={handleReviewChange}
                  className="w-full h-11 rounded-xl border border-line bg-white px-3 text-ink focus:outline-none focus:border-plum-400 focus:ring-4 focus:ring-plum-100">
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-ink mb-1.5">Your review</label>
                <textarea id="comment" name="comment" value={reviewData.comment} onChange={handleReviewChange} rows="4"
                  placeholder="What did you like or dislike? How are you using it?"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-ink focus:outline-none focus:border-plum-400 focus:ring-4 focus:ring-plum-100" />
                {reviewError && <p className="mt-1.5 text-sm text-red-600">{reviewError}</p>}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowReviewForm(false)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink hover:bg-white transition">Cancel</button>
                <button type="submit" className="rounded-full bg-plum-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-plum-700 transition">Submit review</button>
              </div>
            </form>
          )}

          {product.reviews?.length > 0 ? (
            <ul className="divide-y divide-line">
              {product.reviews.map(review => (
                <li key={review._id || `${review.name}-${review.createdAt}`} className="py-6 first:pt-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-plum-50 text-plum-700 font-semibold">
                        {(review.name || '?').charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-ink">{review.name}</p>
                        <Stars rating={review.rating} size="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <time className="text-xs text-ink-soft" dateTime={review.createdAt}>
                      {new Date(review.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </time>
                  </div>
                  <p className="mt-3 text-ink-soft leading-relaxed">{review.comment}</p>
                </li>
              ))}
            </ul>
          ) : (
            !showReviewForm && <p className="text-ink-soft">Be the first to share your thoughts on this product.</p>
          )}
        </div>
      </section>
    </>
  );
};

function WishlistButton({ active, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      title={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full border transition disabled:opacity-60 ${
        active ? 'border-plum-200 bg-plum-50 text-plum-700' : 'border-line bg-white text-ink hover:text-plum-700 hover:border-plum-200'
      }`}
    >
      <Heart className={`w-5 h-5 ${active ? 'fill-plum-600 text-plum-600' : ''}`} />
    </button>
  );
}

export default ProductDetailsMain;
