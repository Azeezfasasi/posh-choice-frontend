import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle, ArrowLeft, Ban, Check, ClipboardList, Copy, Download, Eye, FileText, Mail, MapPin, MessageCircle,
  PackageCheck, PackageSearch, Phone, Printer, RotateCcw, Truck, UserRound,
} from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';
import { useUser } from '../../context-api/user-context/UseUser';
import { formatNaira } from '../../../utils/formatPrice';
import { StatusBadge } from '../dashboard-components/DashUI';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
const PAYMENT_STATUSES = ['Not Paid', 'Processing', 'Paid'];
const STEPS = [
  { status: 'Pending', label: 'Order placed', icon: ClipboardList },
  { status: 'Processing', label: 'Processing', icon: PackageSearch },
  { status: 'Shipped', label: 'Shipped', icon: Truck },
  { status: 'Delivered', label: 'Delivered', icon: PackageCheck },
];

const dateTime = (d) => (d ? new Date(d).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : null);

async function api(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || 'Request failed.');
  return data;
}

// Nigerian numbers like 0801… → 234801… for WhatsApp links
const whatsappNumber = (phone = '') => {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('0') ? `234${digits.slice(1)}` : digits;
};

function Panel({ title, icon, children, className = '' }) {
  const Icon = icon;
  return (
    <section className={`min-w-0 rounded-2xl border border-line bg-white ${className}`}>
      {title && (
        <h2 className="flex items-center gap-2 px-5 pt-5 font-sans text-sm font-semibold uppercase tracking-wider text-ink-soft">
          {Icon && <Icon className="w-4 h-4" />} {title}
        </h2>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

function Timeline({ order }) {
  const closed = ['Cancelled', 'Refunded'].includes(order.status);
  if (closed) {
    const Icon = order.status === 'Cancelled' ? Ban : RotateCcw;
    return (
      <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-red-800">
        <Icon className="w-5 h-5" />
        <p className="text-sm"><span className="font-semibold">Order {order.status.toLowerCase()}.</span> Items were returned to stock.</p>
      </div>
    );
  }
  const current = STEPS.findIndex(s => s.status === order.status);
  const when = { Pending: order.createdAt, Delivered: order.deliveredAt };
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const Icon = step.icon;
        return (
          <li key={step.status} className="relative flex flex-col items-center text-center">
            {i > 0 && <span aria-hidden="true" className={`absolute top-5 right-1/2 w-full h-0.5 ${i <= current ? 'bg-plum-600' : 'bg-line'}`} />}
            <span className={`relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-full ${
              i === current ? 'bg-plum-600 text-white ring-4 ring-plum-100' : done ? 'bg-plum-600 text-white' : 'bg-cream text-ink-soft border border-line'}`}>
              {done && i < current ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </span>
            <span className={`mt-2 text-xs font-semibold ${done ? 'text-ink' : 'text-ink-soft'}`}>{step.label}</span>
            {done && when[step.status] && <span className="text-[11px] text-ink-soft">{new Date(when[step.status]).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>}
          </li>
        );
      })}
    </ol>
  );
}

export default function ViewOrderDetailsMain() {
  const { id: orderId } = useParams();
  const { token } = useUser();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const { data: order, isPending, isError, error, refetch } = useQuery({
    queryKey: ['orderDetails', orderId],
    queryFn: () => api(`/orders/${orderId}`, token),
    enabled: Boolean(orderId && token),
  });

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };
  const onDone = (text) => ({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderDetails', orderId] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      showToast('success', text);
    },
    onError: (err) => showToast('error', err.message),
  });
  const updateStatus = useMutation({
    mutationFn: (value) => api(`/orders/${orderId}/status`, token, { method: 'PUT', body: JSON.stringify({ status: value }) }),
    ...onDone('Order status updated. The customer has been emailed.'),
  });
  const updatePayment = useMutation({
    mutationFn: (value) => api(`/orders/${orderId}/payment-status`, token, { method: 'PUT', body: JSON.stringify({ status: value }) }),
    ...onDone('Payment status updated.'),
  });

  if (isPending) {
    return (
      <div className="grid lg:grid-cols-[1fr_360px] gap-6" aria-busy="true">
        <div className="space-y-6">{[0, 1].map(i => <div key={i} className="h-56 rounded-2xl bg-white border border-line animate-pulse" />)}</div>
        <div className="space-y-6">{[0, 1].map(i => <div key={i} className="h-44 rounded-2xl bg-white border border-line animate-pulse" />)}</div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <p className="mt-3 font-semibold text-red-800">We couldn't load this order</p>
        <p className="mt-1 text-sm text-red-700">{error?.message || 'Order not found.'}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link to="/app/adminorderlist" className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">Back to orders</Link>
          <button type="button" onClick={() => refetch()} className="rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700">Try again</button>
        </div>
      </div>
    );
  }

  const a = order.shippingAddress || {};
  const name = order.userId?.name || a.fullName || 'Guest';
  const email = order.userId?.email || a.email;
  const phone = a.phone;
  const payStatus = order.paymentStatus || (order.isPaid ? 'Paid' : 'Not Paid');
  const items = order.orderItems || [];
  const itemsTotal = typeof order.itemsPrice === 'number'
    ? order.itemsPrice
    : items.reduce((s, i) => s + i.price * i.quantity, 0);
  const proof = order.bankTransferProof;
  const proofIsPdf = proof && proof.toLowerCase().split('?')[0].endsWith('.pdf');

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div role="status" className={`print:hidden fixed top-20 right-4 z-[60] flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-ink text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <Check className="w-4 h-4 text-gold" /> : <AlertCircle className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="hidden print:block mb-4 font-display text-xl font-semibold text-ink">
            Posh Choice Store <span className="font-sans text-sm font-normal text-ink-soft">· Packing slip · (+234) 08157574797 · info@poshchoicestore.com.ng</span>
          </p>
          <Link to="/app/adminorderlist" className="print:hidden inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
            <ArrowLeft className="w-4 h-4" /> All orders
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl font-semibold text-ink">{order.orderNumber}</h2>
            <button type="button" onClick={copyNumber} title="Copy order number" aria-label="Copy order number"
              className="print:hidden inline-flex items-center justify-center w-8 h-8 rounded-full text-ink-soft hover:bg-white hover:text-ink">
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <StatusBadge status={order.status} />
            <StatusBadge status={payStatus} />
          </div>
          <p className="mt-1 text-sm text-ink-soft">Placed {dateTime(order.createdAt)} · {order.paymentMethod}{!order.userId ? ' · Guest checkout' : ''}</p>
        </div>
        <button type="button" onClick={() => window.print()}
          className="print:hidden inline-flex items-center gap-2 self-start md:self-auto rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-cream">
          <Printer className="w-4 h-4" /> Print packing slip
        </button>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        {/* Main column */}
        <div className="space-y-6 min-w-0">
          <Panel title="Progress" className="print:hidden"><Timeline order={order} /></Panel>

          <Panel title={`Items (${items.reduce((s, i) => s + i.quantity, 0)})`} icon={PackageCheck}>
            <ul className="-my-3 divide-y divide-line">
              {items.map((item, i) => {
                const slug = item.productId?.slug;
                return (
                  <li key={i} className="flex items-center gap-4 py-3">
                    <span className="shrink-0 w-14 h-14 rounded-xl bg-cream border border-line overflow-hidden">
                      {item.image && <img src={item.image} alt="" className="w-full h-full object-contain p-1" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      {slug ? (
                        <Link to={`/app/productdetails/slug/${slug}`} target="_blank" className="font-medium text-ink hover:text-plum-700 line-clamp-2">{item.name}</Link>
                      ) : (
                        <p className="font-medium text-ink line-clamp-2">{item.name}</p>
                      )}
                      <p className="text-sm text-ink-soft">{item.quantity} × {formatNaira(item.price)}</p>
                    </div>
                    <p className="font-semibold text-ink tabular-nums whitespace-nowrap">{formatNaira(item.price * item.quantity)}</p>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-5 pt-4 border-t border-line space-y-2 text-sm">
              <div className="flex justify-between text-ink-soft"><dt>Items subtotal</dt><dd className="tabular-nums">{formatNaira(itemsTotal)}</dd></div>
              <div className="flex justify-between text-ink-soft"><dt>Delivery</dt><dd className="tabular-nums">{formatNaira(order.shippingPrice || 0)}</dd></div>
              {order.taxPrice > 0 && <div className="flex justify-between text-ink-soft"><dt>Tax</dt><dd className="tabular-nums">{formatNaira(order.taxPrice)}</dd></div>}
              <div className="flex justify-between pt-2 border-t border-line text-base font-bold text-ink"><dt>Total</dt><dd className="tabular-nums">{formatNaira(order.totalPrice)}</dd></div>
            </dl>
          </Panel>

          {order.paymentMethod === 'Bank Transfer' && (
            <Panel title="Payment proof" icon={FileText} className="print:hidden">
              {order.bankReference && (
                <p className="mb-3 text-sm"><span className="text-ink-soft">Bank reference:</span> <span className="font-semibold text-ink">{order.bankReference}</span></p>
              )}
              {!proof ? (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">The customer hasn't uploaded a payment proof yet.</p>
              ) : proofIsPdf ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
                  <FileText className="w-7 h-7 text-plum-600" />
                  <span className="flex-1 text-sm font-medium text-ink">Payment receipt (PDF)</span>
                  <a href={proof} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-cream"><Eye className="w-4 h-4" /> View</a>
                  <a href={proof} download className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-cream"><Download className="w-4 h-4" /> Download</a>
                </div>
              ) : (
                <a href={proof} target="_blank" rel="noopener noreferrer" className="block" title="Open full size">
                  <img src={proof} alt="Payment proof" className="w-full max-h-[28rem] object-contain rounded-xl border border-line bg-cream" />
                </a>
              )}
              {order.paymentProofUploadedAt && <p className="mt-2 text-xs text-ink-soft">Uploaded {dateTime(order.paymentProofUploadedAt)}</p>}
            </Panel>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-6 min-w-0">
          <Panel title="Manage order" className="print:hidden">
            <div className="space-y-4">
              <div>
                <label htmlFor="order-status" className="block text-sm font-medium text-ink mb-1.5">Order status</label>
                <select id="order-status" value={order.status} disabled={updateStatus.isPending}
                  onChange={(e) => updateStatus.mutate(e.target.value)}
                  className="w-full h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium">
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <p className="mt-1.5 text-xs text-ink-soft">The customer is emailed when this changes.</p>
              </div>
              <div>
                <label htmlFor="payment-status" className="block text-sm font-medium text-ink mb-1.5">Payment status</label>
                <select id="payment-status" value={payStatus} disabled={updatePayment.isPending}
                  onChange={(e) => updatePayment.mutate(e.target.value)}
                  className="w-full h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium">
                  {PAYMENT_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {order.paidAt && <p className="mt-1.5 text-xs text-ink-soft">Paid {dateTime(order.paidAt)}</p>}
              </div>
            </div>
          </Panel>

          <Panel title="Customer" icon={UserRound}>
            <p className="font-semibold text-ink">{name}</p>
            <p className="text-xs text-ink-soft">{order.userId ? 'Registered customer' : 'Guest checkout'}</p>
            <div className="mt-3 space-y-1.5 text-sm">
              {email && <a href={`mailto:${email}`} className="flex items-center gap-2 text-plum-700 hover:underline break-all"><Mail className="w-4 h-4 shrink-0" /> {email}</a>}
              {phone && <a href={`tel:${phone}`} className="flex items-center gap-2 text-plum-700 hover:underline"><Phone className="w-4 h-4 shrink-0" /> {phone}</a>}
            </div>
            {phone && (
              <a href={`https://wa.me/${whatsappNumber(phone)}?text=${encodeURIComponent(`Hello ${name}, this is Posh Choice Store about your order ${order.orderNumber}.`)}`}
                target="_blank" rel="noopener noreferrer"
                className="print:hidden mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366] px-4 py-2.5 text-sm font-semibold text-[#128C4A] hover:bg-[#25D366]/10">
                <MessageCircle className="w-4 h-4" /> Message on WhatsApp
              </a>
            )}
          </Panel>

          <Panel title="Delivery" icon={MapPin}>
            <address className="not-italic text-sm text-ink leading-relaxed">
              {a.fullName}<br />
              {[a.address1, a.address2].filter(Boolean).join(', ')}<br />
              {[a.city, a.state, a.zipCode].filter(Boolean).join(', ')}<br />
              {a.country}
            </address>
            {a.note && (
              <p className="mt-3 rounded-xl bg-gold-soft/60 px-3 py-2 text-sm text-ink"><span className="font-semibold">Customer note:</span> {a.note}</p>
            )}
            {order.deliveredAt && <p className="mt-3 text-xs text-ink-soft">Delivered {dateTime(order.deliveredAt)}</p>}
          </Panel>
        </div>
      </div>
    </div>
  );
}
