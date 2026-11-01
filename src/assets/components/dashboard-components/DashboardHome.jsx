import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Clock, FilePlus2, Heart, MapPinned, MessageSquareQuote, Package, PackageCheck, PackagePlus, ReceiptText, ShoppingBag, Truck, Users, Wallet,
} from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';
import { useUser } from '../../context-api/user-context/UseUser';
import { useCart } from '../../context-api/cart/UseCart';
import { formatNaira } from '../../../utils/formatPrice';
import { Card, CardLink, EmptyNote, StatTile, StatusBadge } from './DashUI';

const CHART_COLOR = '#7a45a3'; // plum-500: passes the lightness/contrast checks on white
const CLOSED = ['Cancelled', 'Refunded'];
const OPEN = ['Pending', 'Processing', 'Shipped'];

const get = async (path, params) => (await axios.get(`${API_BASE_URL}${path}`, { params })).data;

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const shortDate = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

// Compact naira for axis ticks: ₦1.2M, ₦350k
const compactNaira = (v) => (v >= 1e6 ? `₦${(v / 1e6).toFixed(1).replace(/\.0$/, '')}M` : v >= 1e3 ? `₦${Math.round(v / 1e3)}k` : `₦${v}`);

function Welcome({ user, children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-plum-800 via-plum-900 to-ink p-6 md:p-8 text-white">
      <div aria-hidden="true" className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <p className="text-sm text-white/70">{new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h2 className="font-display mt-1 text-2xl md:text-3xl font-semibold">{greeting()}, {user?.name?.split(' ')[0] || 'there'}</h2>
        </div>
        <div className="flex flex-wrap gap-2">{children}</div>
      </div>
    </div>
  );
}

function QuickAction({ to, icon, children, primary }) {
  const Icon = icon;
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
        primary ? 'bg-gold text-ink hover:bg-[#d6b25e]' : 'bg-white/10 text-white hover:bg-white/15 border border-white/15'
      }`}
    >
      <Icon className="w-4 h-4" /> {children}
    </Link>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const { value, payload: row } = payload[0];
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-ink">{label}</p>
      <p className="text-ink-soft">{formatNaira(value)} · {row.count} order{row.count === 1 ? '' : 's'}</p>
    </div>
  );
}

// Horizontal single-hue bars with the label and value as text (identity never relies on colour)
function BarList({ rows, format = (v) => v, emptyText }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  if (!rows.length) return <EmptyNote>{emptyText}</EmptyNote>;
  return (
    <ul className="space-y-3">
      {rows.map(row => (
        <li key={row.label} title={`${row.label}: ${format(row.value)}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-ink truncate">{row.label}</span>
            <span className="font-semibold text-ink tabular-nums">{format(row.value)}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-cream overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(row.value / max) * 100}%`, backgroundColor: CHART_COLOR, minWidth: row.value ? 4 : 0 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RecentOrdersTable({ orders, admin }) {
  if (!orders.length) return <EmptyNote>No orders yet.</EmptyNote>;
  return (
    <div className="-mx-5 md:-mx-6 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-ink-soft border-b border-line">
            <th className="px-5 md:px-6 py-2 font-semibold">Order</th>
            {admin && <th className="px-3 py-2 font-semibold">Customer</th>}
            <th className="px-3 py-2 font-semibold">Date</th>
            <th className="px-3 py-2 font-semibold text-right">Total</th>
            <th className="px-5 md:px-6 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map(order => (
            <tr key={order._id} className="hover:bg-cream/60">
              <td className="px-5 md:px-6 py-3 whitespace-nowrap">
                <Link to={admin ? `/app/vieworderdetails/${order._id}` : `/app/viewuserorderdetails/${order._id}`} className="font-semibold text-plum-700 hover:text-plum-800">
                  {order.orderNumber}
                </Link>
              </td>
              {admin && (
                <td className="px-3 py-3 text-ink max-w-[12rem] truncate">{order.userId?.name || order.shippingAddress?.fullName || 'Guest'}</td>
              )}
              <td className="px-3 py-3 text-ink-soft whitespace-nowrap">{shortDate(order.createdAt)}</td>
              <td className="px-3 py-3 text-right font-semibold text-ink whitespace-nowrap tabular-nums">{formatNaira(order.totalPrice)}</td>
              <td className="px-5 md:px-6 py-3"><StatusBadge status={order.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminOverview({ user }) {
  const orders = useQuery({ queryKey: ['dash', 'orders'], queryFn: () => get('/orders') });
  const users = useQuery({ queryKey: ['dash', 'users'], queryFn: () => get('/users') });
  const quotes = useQuery({ queryKey: ['dash', 'quotes'], queryFn: () => get('/quotes') });
  const productCount = useQuery({ queryKey: ['dash', 'productCount'], queryFn: () => get('/products/count') });
  const categories = useQuery({ queryKey: ['categories'], queryFn: async () => { const d = await get('/categories'); return d.data || d; } });

  // Product count per category (one small request each; uses the API's total)
  const perCategory = useQueries({
    queries: (categories.data || []).map(cat => ({
      queryKey: ['dash', 'categoryCount', cat._id],
      queryFn: async () => (await get('/products', { category: cat._id, limit: 1 })).totalProducts || 0,
    })),
  });

  const orderList = useMemo(() => (Array.isArray(orders.data) ? orders.data : []), [orders.data]);

  const metrics = useMemo(() => {
    const live = orderList.filter(o => !CLOSED.includes(o.status));
    const now = new Date();
    const thisMonth = live.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
      paidRevenue: orderList.filter(o => o.isPaid && !CLOSED.includes(o.status)).reduce((s, o) => s + (o.totalPrice || 0), 0),
      awaitingPayment: live.filter(o => !o.isPaid).length,
      monthValue: thisMonth.reduce((s, o) => s + (o.totalPrice || 0), 0),
      monthCount: thisMonth.length,
      open: orderList.filter(o => OPEN.includes(o.status)).length,
    };
  }, [orderList]);

  // Order value for the last 6 months (cancelled/refunded excluded)
  const monthly = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-NG', { month: 'short' }), value: 0, count: 0 };
    });
    const byKey = Object.fromEntries(months.map(m => [m.key, m]));
    orderList.forEach(o => {
      if (CLOSED.includes(o.status)) return;
      const d = new Date(o.createdAt);
      const m = byKey[`${d.getFullYear()}-${d.getMonth()}`];
      if (m) { m.value += o.totalPrice || 0; m.count += 1; }
    });
    return months;
  }, [orderList]);

  const statusRows = useMemo(() => {
    const counts = orderList.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {});
    return ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']
      .filter(s => counts[s])
      .map(s => ({ label: s, value: counts[s] }));
  }, [orderList]);

  const categoryRows = (categories.data || [])
    .map((cat, i) => ({ label: cat.name, value: perCategory[i]?.data ?? 0 }))
    .filter(r => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const userList = Array.isArray(users.data) ? users.data : [];
  const customers = userList.filter(u => u.role === 'user' || u.role === 'customer').length;
  const quoteList = Array.isArray(quotes.data) ? quotes.data : [];
  const pendingQuotes = quoteList.filter(q => q.status === 'Pending');

  return (
    <div className="space-y-6">
      <Welcome user={user}>
        <QuickAction to="/app/addproduct" icon={PackagePlus} primary>Add product</QuickAction>
        <QuickAction to="/app/adminorderlist" icon={ReceiptText}>View orders</QuickAction>
        <QuickAction to="/app/addnewpost" icon={FilePlus2}>New blog post</QuickAction>
      </Welcome>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile label="Paid revenue" icon={Wallet} loading={orders.isPending} value={formatNaira(metrics.paidRevenue)}
          hint={`${metrics.awaitingPayment} order${metrics.awaitingPayment === 1 ? '' : 's'} awaiting payment`} to="/app/adminorderlist" />
        <StatTile label="Orders this month" icon={ReceiptText} loading={orders.isPending} value={metrics.monthCount}
          hint={`${formatNaira(metrics.monthValue)} in order value`} to="/app/adminorderlist" />
        <StatTile label="Open orders" icon={Truck} loading={orders.isPending} value={metrics.open}
          hint="Pending, processing or shipped" to="/app/adminorderlist" />
        <StatTile label="Products" icon={Package} loading={productCount.isPending} value={productCount.data?.count ?? 0}
          hint={`${categories.data?.length || 0} categories`} to="/app/products" />
        <StatTile label="Customers" icon={Users} loading={users.isPending} value={customers}
          hint={`${userList.length} accounts in total`} to="/app/allusers" />
        <StatTile label="Quote requests" icon={MessageSquareQuote} loading={quotes.isPending} value={quoteList.length}
          hint={`${pendingQuotes.length} pending`} to="/app/quote" />
        <StatTile label="All-time orders" icon={PackageCheck} loading={orders.isPending} value={orderList.length}
          hint={`${statusRows.find(r => r.label === 'Delivered')?.value || 0} delivered`} to="/app/adminorderlist" />
        <StatTile label="Awaiting payment" icon={Clock} loading={orders.isPending} value={metrics.awaitingPayment}
          hint="Confirm bank transfers in Orders" to="/app/adminorderlist" />
      </div>

      <div className="grid xl:grid-cols-3 gap-6 items-start">
        <Card title="Order value by month" subtitle="Last 6 months, excluding cancelled and refunded orders" className="xl:col-span-2">
          {orders.isPending ? (
            <div className="h-64 rounded-xl bg-cream animate-pulse" />
          ) : (
            <>
              <div className="h-64" role="img" aria-label={`Order value by month: ${monthly.map(m => `${m.label} ${formatNaira(m.value)}`).join(', ')}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#ece7e1" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#4a5470', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} width={56} tick={{ fill: '#4a5470', fontSize: 12 }} tickFormatter={compactNaira} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f6f1fa' }} />
                    <Bar dataKey="value" fill={CHART_COLOR} radius={[4, 4, 0, 0]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Table view of the same data */}
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-ink-soft hover:text-ink">Show as table</summary>
                <table className="mt-2 w-full">
                  <tbody className="divide-y divide-line">
                    {monthly.map(m => (
                      <tr key={m.key}><td className="py-1.5 text-ink">{m.label}</td><td className="py-1.5 text-right text-ink-soft">{m.count} orders</td><td className="py-1.5 text-right font-semibold text-ink">{formatNaira(m.value)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          )}
        </Card>

        <Card title="Orders by status" action={<CardLink to="/app/adminorderlist">Manage</CardLink>}>
          {orders.isPending ? <div className="h-48 rounded-xl bg-cream animate-pulse" /> : <BarList rows={statusRows} emptyText="No orders yet." />}
        </Card>
      </div>

      <div className="grid xl:grid-cols-3 gap-6 items-start">
        <Card title="Recent orders" action={<CardLink to="/app/adminorderlist">All orders</CardLink>} className="xl:col-span-2">
          {orders.isPending ? <div className="h-48 rounded-xl bg-cream animate-pulse" /> : <RecentOrdersTable orders={orderList.slice(0, 6)} admin />}
        </Card>

        <div className="space-y-6">
          <Card title="Products by category" action={<CardLink to="/app/productcategories">Categories</CardLink>}>
            {categories.isPending ? <div className="h-40 rounded-xl bg-cream animate-pulse" /> : <BarList rows={categoryRows} emptyText="No products yet." />}
          </Card>
          <Card title="Pending quote requests" action={<CardLink to="/app/quote">View all</CardLink>}>
            {quotes.isPending ? (
              <div className="h-24 rounded-xl bg-cream animate-pulse" />
            ) : pendingQuotes.length === 0 ? (
              <EmptyNote>You're all caught up.</EmptyNote>
            ) : (
              <ul className="divide-y divide-line -my-2">
                {pendingQuotes.slice(0, 4).map(q => (
                  <li key={q._id} className="py-2.5">
                    <p className="text-sm font-semibold text-ink truncate">{q.name}</p>
                    <p className="text-xs text-ink-soft truncate">{q.service} · {shortDate(q.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function CustomerOverview({ user }) {
  const { wishlist } = useCart();
  const orders = useQuery({ queryKey: ['dash', 'myOrders'], queryFn: () => get('/orders/myorders') });
  const list = (Array.isArray(orders.data) ? orders.data : []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const inProgress = list.filter(o => OPEN.includes(o.status)).length;
  const delivered = list.filter(o => o.status === 'Delivered').length;

  return (
    <div className="space-y-6">
      <Welcome user={user}>
        <QuickAction to="/app/shop" icon={ShoppingBag} primary>Continue shopping</QuickAction>
        <QuickAction to="/app/trackorder" icon={MapPinned}>Track an order</QuickAction>
      </Welcome>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile label="My orders" icon={ReceiptText} loading={orders.isPending} value={list.length} to="/app/userorderdetails" />
        <StatTile label="In progress" icon={Truck} loading={orders.isPending} value={inProgress} hint="Pending, processing or shipped" to="/app/userorderdetails" />
        <StatTile label="Delivered" icon={PackageCheck} loading={orders.isPending} value={delivered} to="/app/userorderdetails" />
        <StatTile label="Wishlist" icon={Heart} value={wishlist?.products?.length || 0} hint="Saved for later" to="/app/wishlist" />
      </div>

      <Card title="Recent orders" action={<CardLink to="/app/userorderdetails">All orders</CardLink>}>
        {orders.isPending ? (
          <div className="h-40 rounded-xl bg-cream animate-pulse" />
        ) : list.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-ink-soft">You haven't placed any orders with this account yet.</p>
            <Link to="/app/shop" className="mt-4 inline-flex rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700">Start shopping</Link>
          </div>
        ) : (
          <RecentOrdersTable orders={list.slice(0, 5)} />
        )}
      </Card>
    </div>
  );
}

function DashboardHome() {
  const { user, isAdmin } = useUser();
  if (!user) return null;
  return isAdmin ? <AdminOverview user={user} /> : <CustomerOverview user={user} />;
}

export default DashboardHome;
