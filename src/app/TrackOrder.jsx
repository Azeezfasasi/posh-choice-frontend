import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Ban, Check, ClipboardList, Loader2, PackageCheck, PackageSearch, RotateCcw, Search, Truck } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { Helmet } from 'react-helmet';
import TopHeader from '../assets/components/TopHeader';
import MainHeader from '../assets/components/MainHeader';
import Footer from '../assets/components/Footer';
import PageHeader from '../assets/components/PageHeader';
import { formatNaira } from '../utils/formatPrice';

const STEPS = [
  { status: 'Pending', label: 'Order received', text: "We've received your order.", icon: ClipboardList },
  { status: 'Processing', label: 'Processing', text: "We're preparing your items.", icon: PackageSearch },
  { status: 'Shipped', label: 'On the way', text: 'Your order has been dispatched.', icon: Truck },
  { status: 'Delivered', label: 'Delivered', text: 'Your order has been delivered.', icon: PackageCheck },
];

const CLOSED = {
  Cancelled: { label: 'Order cancelled', text: 'This order was cancelled. If you did not request this, please contact us.', icon: Ban },
  Refunded: { label: 'Order refunded', text: 'This order has been refunded. It may take a few days to reflect in your account.', icon: RotateCcw },
};

const normalise = (value) => value.trim().toUpperCase();

const TrackOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const submittedOrderNumber = searchParams.get('order') ? normalise(searchParams.get('order')) : null;
  const [orderNumberInput, setOrderNumberInput] = useState(submittedOrderNumber || '');

  const { data: order, isFetching, isError, error } = useQuery({
    queryKey: ['publicOrder', submittedOrderNumber],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/orders/public-status/${encodeURIComponent(submittedOrderNumber)}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`We couldn't find order "${submittedOrderNumber}". Please check the number and try again.`);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "We couldn't check this order right now. Please try again shortly.");
      }
      return response.json();
    },
    enabled: Boolean(submittedOrderNumber),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  // The order number lives in the URL, so ?order=POSH000000123 links open straight to the result
  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderNumberInput.trim()) setSearchParams({ order: normalise(orderNumberInput) });
  };

  const closed = order && CLOSED[order.status];
  const currentStep = order ? STEPS.findIndex(s => s.status === order.status) : -1;

  return (
    <>
    <Helmet>
        <title>Track your order - Posh Choice Store</title>
    </Helmet>
    <TopHeader />
    <MainHeader />
    <PageHeader
      title="Track your order"
      subtitle="Enter the order number from your confirmation email. No account needed."
      crumbs={[{ label: 'Track order' }]}
    />

    <section className="bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" role="search">
          <label htmlFor="order-number" className="sr-only">Order number</label>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft pointer-events-none" />
            <input
              id="order-number"
              type="text"
              placeholder="e.g. POSH000000123"
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="w-full h-13 pl-12 pr-4 py-3.5 rounded-full border border-line bg-cream text-ink uppercase placeholder:normal-case placeholder:text-ink-soft/70 focus:outline-none focus:bg-white focus:border-plum-400 focus:ring-4 focus:ring-plum-100 transition"
            />
          </div>
          <button
            type="submit"
            disabled={!orderNumberInput.trim() || isFetching}
            className="h-13 px-8 py-3.5 rounded-full bg-plum-600 text-white font-semibold hover:bg-plum-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isFetching ? 'Checking…' : 'Track order'}
          </button>
        </form>

        <div className="mt-8" aria-live="polite">
          {/* Prompt */}
          {!submittedOrderNumber && (
            <div className="rounded-3xl border border-dashed border-line bg-cream px-6 py-12 text-center">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-plum-50 text-plum-600 mb-4">
                <PackageSearch className="w-7 h-7" strokeWidth={1.75} />
              </span>
              <p className="font-semibold text-ink">Where's my order?</p>
              <p className="mt-1 text-sm text-ink-soft max-w-sm mx-auto">
                Your order number starts with <span className="font-semibold text-ink">POSH</span> and is in your order confirmation email.
              </p>
            </div>
          )}

          {/* Loading */}
          {isFetching && submittedOrderNumber && (
            <div className="rounded-3xl border border-line p-6 space-y-4" aria-busy="true">
              <div className="h-6 w-1/2 rounded bg-cream animate-pulse" />
              <div className="h-24 rounded-2xl bg-cream animate-pulse" />
            </div>
          )}

          {/* Error */}
          {isError && !isFetching && (
            <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 flex gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <p className="font-semibold text-red-800">Order not found</p>
                <p className="mt-1 text-sm text-red-700">{error?.message}</p>
                <p className="mt-3 text-sm text-red-700">
                  Still stuck? <Link to="/contactus" className="font-semibold underline underline-offset-2">Contact us</Link> and we'll help.
                </p>
              </div>
            </div>
          )}

          {/* Result */}
          {order && !isFetching && !isError && (
            <div className="rounded-3xl border border-line overflow-hidden">
              <div className="bg-cream px-6 py-5 flex flex-wrap items-start justify-between gap-4 border-b border-line">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Order</p>
                  <p className="font-display text-2xl font-semibold text-ink">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Placed {new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-ink-soft">Total</p>
                  <p className="text-xl font-bold text-ink">{formatNaira(order.totalPrice)}</p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-gold-soft text-[#7a5c17]'}`}>
                    {order.isPaid ? 'Paid' : 'Payment pending'}
                  </span>
                </div>
              </div>

              <div className="px-6 py-8">
                {closed ? (
                  <div className="flex gap-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 shrink-0">
                      {React.createElement(closed.icon, { className: 'w-6 h-6', strokeWidth: 1.75 })}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{closed.label}</p>
                      <p className="mt-1 text-sm text-ink-soft">{closed.text}</p>
                    </div>
                  </div>
                ) : (
                  <ol className="relative space-y-8">
                    {STEPS.map((step, index) => {
                      const done = index < currentStep;
                      const active = index === currentStep;
                      return (
                        <li key={step.status} className="relative flex gap-4">
                          {index < STEPS.length - 1 && (
                            <span aria-hidden="true" className={`absolute left-6 top-12 -bottom-8 w-0.5 -translate-x-1/2 ${index < currentStep ? 'bg-plum-600' : 'bg-line'}`} />
                          )}
                          <span className={`relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-full shrink-0 transition ${
                            done ? 'bg-plum-600 text-white' : active ? 'bg-plum-600 text-white ring-8 ring-plum-100' : 'bg-cream text-ink-soft border border-line'
                          }`}>
                            {done ? <Check className="w-5 h-5" /> : React.createElement(step.icon, { className: 'w-5 h-5', strokeWidth: 1.75 })}
                          </span>
                          <div className="pt-1.5">
                            <p className={`font-semibold ${done || active ? 'text-ink' : 'text-ink-soft'}`}>
                              {step.label}
                              {active && <span className="ml-2 rounded-full bg-plum-50 px-2 py-0.5 text-xs font-semibold text-plum-700">Current</span>}
                            </p>
                            <p className="text-sm text-ink-soft">{step.text}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>

              <div className="px-6 py-4 border-t border-line bg-cream/60 text-sm text-ink-soft flex flex-wrap items-center justify-between gap-2">
                <span>Questions about this order?</span>
                <Link to="/contactus" className="font-semibold text-plum-700 hover:text-plum-800">Contact us</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
    <Footer />
    </>
  );
};

export default TrackOrder;
