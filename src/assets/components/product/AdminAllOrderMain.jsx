import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertCircle, Check, ChevronLeft, ChevronRight, Download, Eye, FileText, Paperclip, RefreshCw, Search, Trash2, X,
} from 'lucide-react';
import { useUser } from '../../context-api/user-context/UseUser';
import { API_BASE_URL } from '../../../config/api';
import { formatNaira } from '../../../utils/formatPrice';
import { StatusBadge } from '../dashboard-components/DashUI';

const PAGE_SIZE = 15;
const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
const PAYMENT_STATUSES = ['Not Paid', 'Processing', 'Paid'];

// Select styling per value (status text is always visible, colour is secondary)
const SELECT_TONE = {
  Pending: 'bg-amber-50 text-amber-800 border-amber-200',
  Processing: 'bg-sky-50 text-sky-800 border-sky-200',
  Shipped: 'bg-plum-50 text-plum-800 border-plum-200',
  Delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Refunded: 'bg-slate-100 text-slate-700 border-slate-200',
  Paid: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Not Paid': 'bg-amber-50 text-amber-800 border-amber-200',
};

const customerName = (o) => o.userId?.name || o.shippingAddress?.fullName || 'Guest';
const customerEmail = (o) => o.userId?.email || o.shippingAddress?.email || '';
const shortDate = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

async function api(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || 'Request failed.');
  return data;
}

function pageList(current, total) {
  const pages = [...new Set([1, total, current - 1, current, current + 1])].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  return pages.flatMap((p, i) => (i > 0 && p - pages[i - 1] > 1 ? ['…' + p, p] : [p]));
}

function OrderDrawer({ order, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const a = order.shippingAddress || {};
  const proof = order.bankTransferProof;
  const proofIsPdf = proof && proof.toLowerCase().split('?')[0].endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`Order ${order.orderNumber}`}>
      <button type="button" className="absolute inset-0 bg-ink/40 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col">
        <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-line">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Order</p>
            <h2 className="font-display text-2xl font-semibold text-ink">{order.orderNumber}</h2>
            <p className="text-sm text-ink-soft">Placed {new Date(order.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-cream">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus || (order.isPaid ? 'Paid' : 'Not Paid')} />
            <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-ink ring-1 ring-inset ring-line">{order.paymentMethod}</span>
          </div>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">Customer</h3>
            <p className="font-semibold text-ink">{customerName(order)} {!order.userId && <span className="text-xs font-normal text-ink-soft">(guest)</span>}</p>
            {customerEmail(order) && <a href={`mailto:${customerEmail(order)}`} className="block text-plum-700 hover:underline">{customerEmail(order)}</a>}
            {a.phone && <a href={`tel:${a.phone}`} className="block text-plum-700 hover:underline">{a.phone}</a>}
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">Delivery address</h3>
            <p className="text-ink leading-relaxed">
              {[a.address1, a.address2].filter(Boolean).join(', ')}<br />
              {[a.city, a.state, a.zipCode].filter(Boolean).join(', ')}<br />
              {a.country}
            </p>
            {a.note && <p className="mt-2 rounded-xl bg-gold-soft/60 px-3 py-2 text-ink"><span className="font-semibold">Note:</span> {a.note}</p>}
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">Items</h3>
            <ul className="divide-y divide-line rounded-xl border border-line">
              {(order.orderItems || []).map((item, i) => (
                <li key={i} className="flex items-center gap-3 p-3">
                  {item.image && <img src={item.image} alt="" className="w-11 h-11 rounded-lg object-contain bg-cream border border-line" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink truncate">{item.name}</p>
                    <p className="text-xs text-ink-soft">{item.quantity} × {formatNaira(item.price)}</p>
                  </div>
                  <p className="font-semibold text-ink">{formatNaira(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5">
              <div className="flex justify-between text-ink-soft"><dt>Items</dt><dd>{formatNaira(order.itemsPrice)}</dd></div>
              <div className="flex justify-between text-ink-soft"><dt>Delivery</dt><dd>{formatNaira(order.shippingPrice)}</dd></div>
              <div className="flex justify-between font-semibold text-ink text-base pt-1.5 border-t border-line"><dt>Total</dt><dd>{formatNaira(order.totalPrice)}</dd></div>
            </dl>
          </section>

          {order.paymentMethod === 'Bank Transfer' && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">Payment proof</h3>
              {order.bankReference && <p className="mb-2 text-ink"><span className="text-ink-soft">Reference:</span> {order.bankReference}</p>}
              {!proof ? (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800">No proof uploaded yet.</p>
              ) : proofIsPdf ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3">
                  <FileText className="w-6 h-6 text-plum-600" />
                  <span className="flex-1 text-ink">Payment receipt (PDF)</span>
                  <a href={proof} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold hover:bg-cream"><Eye className="w-3.5 h-3.5" /> View</a>
                  <a href={proof} download className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold hover:bg-cream"><Download className="w-3.5 h-3.5" /> Download</a>
                </div>
              ) : (
                <a href={proof} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={proof} alt="Payment proof" className="w-full max-h-96 object-contain rounded-xl border border-line bg-cream" />
                </a>
              )}
              {order.paymentProofUploadedAt && <p className="mt-1.5 text-xs text-ink-soft">Uploaded {new Date(order.paymentProofUploadedAt).toLocaleString('en-NG')}</p>}
            </section>
          )}
        </div>

        <footer className="px-6 py-4 border-t border-line flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">Close</button>
          <Link to={`/app/vieworderdetails/${order._id}`} className="rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700">Full details</Link>
        </footer>
      </aside>
    </div>
  );
}

const AdminAllOrderMain = () => {
  const { token, isAdmin } = useUser();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [payment, setPayment] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const { data: orders = [], isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['allOrders'],
    queryFn: () => api('/orders', token),
    enabled: Boolean(token) && isAdmin,
    staleTime: 60 * 1000,
  });

  const onDone = (text) => ({
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['allOrders'] }); showToast('success', text); },
    onError: (err) => showToast('error', err.message),
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, value }) => api(`/orders/${orderId}/status`, token, { method: 'PUT', body: JSON.stringify({ status: value }) }),
    ...onDone('Order status updated. The customer has been emailed.'),
  });
  const updatePayment = useMutation({
    mutationFn: ({ orderId, value }) => api(`/orders/${orderId}/payment-status`, token, { method: 'PUT', body: JSON.stringify({ status: value }) }),
    ...onDone('Payment status updated.'),
  });
  const deleteOrder = useMutation({
    mutationFn: (orderId) => api(`/orders/${orderId}`, token, { method: 'DELETE' }),
    ...onDone('Order deleted.'),
  });

  const counts = useMemo(
    () => orders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {}),
    [orders]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter(o => {
      if (status && o.status !== status) return false;
      if (payment && (o.paymentStatus || (o.isPaid ? 'Paid' : 'Not Paid')) !== payment) return false;
      if (!term) return true;
      return [o.orderNumber, customerName(o), customerEmail(o), o.shippingAddress?.phone]
        .some(v => v && String(v).toLowerCase().includes(term));
    });
  }, [orders, search, status, payment]);

  // Back to page 1 whenever the filters change
  useEffect(() => { setPage(1); }, [search, status, payment]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (isError) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <p className="mt-3 font-semibold text-red-800">We couldn't load orders</p>
        <p className="mt-1 text-sm text-red-700">{error?.message}</p>
        <button type="button" onClick={() => refetch()} className="mt-5 rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700">Try again</button>
      </div>
    );
  }

  const tabs = [{ value: '', label: 'All', count: orders.length }, ...ORDER_STATUSES.map(s => ({ value: s, label: s, count: counts[s] || 0 }))];

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div role="status" className={`fixed top-20 right-4 z-[60] flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-ink text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <Check className="w-4 h-4 text-gold" /> : <AlertCircle className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Filter by status">
        {tabs.map(t => (
          <button key={t.label} type="button" role="tab" aria-selected={status === t.value} onClick={() => setStatus(t.value)}
            className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              status === t.value ? 'border-plum-600 bg-plum-600 text-white' : 'border-line bg-white text-ink hover:border-plum-300'}`}>
            {t.label}
            <span className={`rounded-full px-1.5 text-xs font-semibold ${status === t.value ? 'bg-white/20 text-white' : 'bg-cream text-ink-soft'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-white">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 border-b border-line">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order number, customer, email or phone"
              aria-label="Search orders" className="w-full h-10 pl-10 pr-3 rounded-full border border-line bg-cream text-sm focus:bg-white" />
          </div>
          <select value={payment} onChange={e => setPayment(e.target.value)} aria-label="Filter by payment" className="h-10 rounded-full border border-line bg-white px-4 text-sm">
            <option value="">All payments</option>
            {PAYMENT_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button type="button" onClick={() => refetch()} className="inline-flex items-center justify-center gap-2 h-10 rounded-full border border-line px-4 text-sm font-medium text-ink hover:bg-cream">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Table */}
        {isPending ? (
          <div className="p-4 space-y-2" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-cream animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-semibold text-ink">No orders found</p>
            <p className="mt-1 text-sm text-ink-soft">Try a different search or filter.</p>
            {(search || status || payment) && (
              <button type="button" onClick={() => { setSearch(''); setStatus(''); setPayment(''); }} className="mt-4 text-sm font-semibold text-plum-700 hover:text-plum-800">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider border-b border-line">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold text-right">Total</th>
                  <th className="px-4 py-3 font-semibold">Order status</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pageRows.map(order => {
                  const pay = order.paymentStatus || (order.isPaid ? 'Paid' : 'Not Paid');
                  const itemCount = (order.orderItems || []).reduce((s, i) => s + (i.quantity || 0), 0);
                  return (
                    <tr key={order._id} className="hover:bg-cream/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button type="button" onClick={() => setSelected(order)} className="font-semibold text-plum-700 hover:text-plum-800">{order.orderNumber}</button>
                        <p className="text-xs text-ink-soft">{shortDate(order.createdAt)} · {itemCount} item{itemCount === 1 ? '' : 's'}</p>
                      </td>
                      <td className="px-4 py-3 min-w-[12rem]">
                        <p className="font-medium text-ink">{customerName(order)}{!order.userId && <span className="ml-1.5 text-xs font-normal text-ink-soft">guest</span>}</p>
                        <p className="text-xs text-ink-soft truncate max-w-[16rem]">{customerEmail(order) || order.shippingAddress?.phone || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ink whitespace-nowrap tabular-nums">{formatNaira(order.totalPrice)}</td>
                      <td className="px-4 py-3">
                        <select value={order.status} aria-label={`Status of ${order.orderNumber}`}
                          disabled={updateStatus.isPending}
                          onChange={(e) => updateStatus.mutate({ orderId: order._id, value: e.target.value })}
                          className={`h-9 rounded-full border px-3 pr-8 text-xs font-semibold ${SELECT_TONE[order.status] || ''}`}>
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select value={pay} aria-label={`Payment status of ${order.orderNumber}`}
                            disabled={updatePayment.isPending}
                            onChange={(e) => updatePayment.mutate({ orderId: order._id, value: e.target.value })}
                            className={`h-9 rounded-full border px-3 pr-8 text-xs font-semibold ${SELECT_TONE[pay] || ''}`}>
                            {PAYMENT_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          {order.bankTransferProof && (
                            <span title="Payment proof uploaded" className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-plum-50 text-plum-700">
                              <Paperclip className="w-3.5 h-3.5" /><span className="sr-only">Payment proof uploaded</span>
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-ink-soft">{order.paymentMethod}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => setSelected(order)} title="View order" aria-label={`View ${order.orderNumber}`}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-ink hover:bg-plum-50 hover:text-plum-700">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button type="button" title="Delete order" aria-label={`Delete ${order.orderNumber}`} disabled={deleteOrder.isPending}
                            onClick={() => { if (window.confirm(`Delete order ${order.orderNumber}? This cannot be undone.`)) deleteOrder.mutate(order._id); }}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-ink-soft hover:bg-red-50 hover:text-red-600 disabled:opacity-40">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isPending && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-line">
            <p className="text-sm text-ink-soft">
              Showing <span className="font-semibold text-ink">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> of{' '}
              <span className="font-semibold text-ink">{filtered.length}</span> orders
            </p>
            {totalPages > 1 && (
              <nav className="flex items-center gap-1" aria-label="Pagination">
                <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-line hover:bg-cream disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {pageList(currentPage, totalPages).map(p => typeof p === 'string' ? (
                  <span key={p} className="px-1 text-ink-soft">…</span>
                ) : (
                  <button key={p} type="button" onClick={() => setPage(p)} aria-current={p === currentPage ? 'page' : undefined}
                    className={`min-w-9 h-9 px-2 rounded-full text-sm font-medium ${p === currentPage ? 'bg-plum-600 text-white' : 'text-ink hover:bg-cream'}`}>
                    {p}
                  </button>
                ))}
                <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-line hover:bg-cream disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </div>
        )}
      </div>

      {selected && <OrderDrawer order={orders.find(o => o._id === selected._id) || selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default AdminAllOrderMain;
