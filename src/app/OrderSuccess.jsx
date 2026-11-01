import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle2, ClipboardList, MapPinned, ShoppingBag } from 'lucide-react';
import TopHeader from '../assets/components/TopHeader';
import MainHeader from '../assets/components/MainHeader';
import Footer from '../assets/components/Footer';
import { useUser } from '../assets/context-api/user-context/UseUser';

const OrderSuccess = () => {
  const location = useLocation();
  const { user } = useUser();
  const orderNumber = location.state?.orderNumber;

  return (
    <>
    <Helmet>
      <title>Order confirmed - Posh Choice Store</title>
    </Helmet>
    <TopHeader />
    <MainHeader />
    <main className="bg-cream">
      <div className="max-w-xl mx-auto px-4 py-14 md:py-20">
        <div className="rounded-3xl bg-white border border-line p-8 md:p-10 text-center shadow-[0_12px_40px_-20px_rgba(15,27,61,0.25)]">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-5">
            <CheckCircle2 className="w-9 h-9" strokeWidth={1.75} />
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">Thank you for your order</h1>
          <p className="mt-3 text-ink-soft">
            We've received your order and will start processing it shortly. A confirmation has been sent to your email.
          </p>

          {orderNumber && (
            <div className="mt-7 rounded-2xl bg-cream border border-line px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Your order number</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink tracking-wide select-all">{orderNumber}</p>
              <p className="mt-1 text-xs text-ink-soft">Keep this number to track your order.</p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to={orderNumber ? `/app/trackorder?order=${encodeURIComponent(orderNumber)}` : '/app/trackorder'}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-plum-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-plum-700 transition"
            >
              <MapPinned className="w-4 h-4" /> Track this order
            </Link>
            {user && (
              <Link
                to="/app/userorderdetails"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3.5 text-sm font-semibold text-ink hover:bg-cream transition"
              >
                <ClipboardList className="w-4 h-4" /> View all my orders
              </Link>
            )}
            <Link to="/app/shop" className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-semibold text-plum-700 hover:text-plum-800">
              <ShoppingBag className="w-4 h-4" /> Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
};

export default OrderSuccess;
