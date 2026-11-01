import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context-api/cart/UseCart';
import { ArrowRight, Lock, Minus, Plus, ShoppingBag, Trash2, Wallet } from 'lucide-react';
import PageHeader from '../PageHeader';
import { formatNaira } from '../../../utils/formatPrice';

const PLACEHOLDER = 'https://placehold.co/160x160/FAF8F5/4A5470?text=Posh';
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '2348157574797';

// Cart items may hold a populated product object or a plain id
const itemProductId = (item) => String(item.productId?._id || item.productId);
const itemSlug = (item) => item.productId?.slug || item.slug;
const itemStock = (item) => item.productId?.stockQuantity;

const CartMain = () => {
  const {
    cart,
    loading,
    error,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  } = useCart();

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = items.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);

  const changeQuantity = (item, newQuantity) => {
    const stock = itemStock(item);
    if (newQuantity < 1 || (stock && newQuantity > stock)) return;
    updateCartItemQuantity(itemProductId(item), newQuantity);
  };

  const handleClearCart = () => {
    if (window.confirm('Remove all items from your cart?')) clearCart();
  };

  const whatsappText = [
    'Hello Posh Choice, I would like to place an order:',
    '',
    ...items.map(i => `${i.name} x${i.quantity} = ${formatNaira(i.price * i.quantity)}`),
    '',
    `Subtotal: ${formatNaira(cartSubtotal)}`,
  ].join('\n');
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;

  // Full-page loading only on the first load; quantity updates keep the cart visible
  if (loading && !cart) {
    return (
      <>
        <PageHeader title="Your cart" crumbs={[{ label: 'Cart' }]} />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-4" aria-busy="true">
          {[0, 1, 2].map(i => <div key={i} className="h-28 rounded-2xl bg-cream animate-pulse" />)}
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Your cart" crumbs={[{ label: 'Cart' }]} />
        <div className="max-w-xl mx-auto px-4 py-16 md:py-24 text-center">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-plum-50 text-plum-600 mb-5">
            <ShoppingBag className="w-8 h-8" strokeWidth={1.75} />
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">Your cart is empty</h2>
          <p className="mt-2 text-ink-soft">
            {error ? "We couldn't load your cart. Please refresh the page." : "Looks like you haven't added anything yet."}
          </p>
          <Link to="/app/shop" className="mt-7 inline-flex items-center gap-2 rounded-full bg-plum-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-plum-700 transition">
            Start shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Your cart"
        subtitle={`${itemCount} item${itemCount === 1 ? '' : 's'} in your cart`}
        crumbs={[{ label: 'Cart' }]}
      />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
          {/* Items */}
          <div>
            {error && (
              <p role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>
            )}
            <ul className={`divide-y divide-line border-y border-line transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
              {items.map((item) => {
                const stock = itemStock(item);
                const slug = itemSlug(item);
                return (
                  <li key={item._id || itemProductId(item)} className="py-5 flex gap-4 md:gap-6">
                    <Link to={slug ? `/app/productdetails/slug/${slug}` : '/app/shop'} className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-cream border border-line overflow-hidden">
                      <img
                        src={item.image || PLACEHOLDER}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER; }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <Link to={slug ? `/app/productdetails/slug/${slug}` : '/app/shop'} className="font-semibold text-ink hover:text-plum-700 transition line-clamp-2">
                            {item.name}
                          </Link>
                          <p className="mt-1 text-sm text-ink-soft">{formatNaira(item.price)} each</p>
                        </div>
                        <p className="font-bold text-ink whitespace-nowrap">{formatNaira(item.price * item.quantity)}</p>
                      </div>
                      <div className="mt-auto pt-3 flex items-center justify-between gap-4">
                        <div className="inline-flex items-center rounded-full border border-line">
                          <button type="button" onClick={() => changeQuantity(item, item.quantity - 1)} disabled={loading || item.quantity <= 1}
                            className="w-9 h-9 inline-flex items-center justify-center rounded-full text-ink hover:bg-cream disabled:opacity-40" aria-label={`Decrease quantity of ${item.name}`}>
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-ink" aria-live="polite">{item.quantity}</span>
                          <button type="button" onClick={() => changeQuantity(item, item.quantity + 1)} disabled={loading || (stock && item.quantity >= stock)}
                            className="w-9 h-9 inline-flex items-center justify-center rounded-full text-ink hover:bg-cream disabled:opacity-40" aria-label={`Increase quantity of ${item.name}`}>
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button type="button" onClick={() => removeCartItem(item._id)} disabled={loading}
                          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-red-600 transition disabled:opacity-40">
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex items-center justify-between">
              <Link to="/app/shop" className="text-sm font-semibold text-plum-700 hover:text-plum-800">← Continue shopping</Link>
              <button type="button" onClick={handleClearCart} disabled={loading} className="text-sm text-ink-soft hover:text-red-600 transition disabled:opacity-40">
                Clear cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28 rounded-3xl border border-line bg-cream p-6">
            <h2 className="font-display text-xl font-semibold text-ink">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal ({itemCount} item{itemCount === 1 ? '' : 's'})</dt>
                <dd className="font-semibold text-ink">{formatNaira(cartSubtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Delivery</dt>
                <dd className="text-ink-soft">Calculated at checkout</dd>
              </div>
            </dl>
            <div className="mt-5 pt-5 border-t border-line flex justify-between items-baseline">
              <span className="font-semibold text-ink">Estimated total</span>
              <span className="text-2xl font-bold text-ink">{formatNaira(cartSubtotal)}</span>
            </div>
            <Link
              to="/app/checkout"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-plum-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-plum-700 transition"
            >
              <Lock className="w-4 h-4" /> Proceed to checkout
            </Link>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366] bg-white px-6 py-3.5 text-sm font-semibold text-[#128C4A] hover:bg-[#25D366]/10 transition"
            >
              Order on WhatsApp instead
            </a>
            <p className="mt-5 flex items-start gap-2 text-xs text-ink-soft">
              <Wallet className="w-4 h-4 text-plum-600 shrink-0" />
              Pay by bank transfer or order on WhatsApp. No account needed.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
};

export default CartMain;
