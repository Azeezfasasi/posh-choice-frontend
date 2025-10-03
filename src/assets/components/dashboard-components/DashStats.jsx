import React, { useEffect, useState } from 'react';
import { useUser } from '../../context-api/user-context/UseUser';
import { useQuote } from '../../context-api/Request-quote-context/UseQuote';
import Spinner from '../Spinner';
import { API_BASE_URL } from '../../../config/api';
import { Link } from 'react-router-dom';

function DashStats() {
  const { getAllUsers, loading: userLoading, isSuperAdmin, isAdmin, isCustomer, user } = useUser();
  const { quotes, loading: quoteLoading } = useQuote();
  const [stats, setStats] = useState({
    totalUsers: 0,
    superAdmins: 0,
    admins: 0,
    customers: 0,
    users: 0,
    totalQuotes: 0,
    myQuotes: 0,
    myPending: 0,
    myCompleted: 0,
  });
  const [orderCount, setOrderCount] = useState(0);
  const [customerOrderCount, setCustomerOrderCount] = useState(0);
  const [orderLoading, setOrderLoading] = useState(false);
  const [productCount, setProductCount] = useState(0);

  // Fetch users ONCE on mount
  useEffect(() => {
    const fetchStats = async () => {
      const users = await getAllUsers();
      setStats(prev => ({
        ...prev,
        totalUsers: users ? users.length : 0,
        superAdmins: users ? users.filter(u => u.role === 'super admin').length : 0,
        admins: users ? users.filter(u => u.role === 'admin').length : 0,
        customers: users ? users.filter(u => u.role === 'customer').length : 0,
        users: users ? users.filter(u => u.role === 'user').length : 0,
      }));
    };
    fetchStats();
    // eslint-disable-next-line
  }, []);

  // Fetch total orders for admin/super admin
  useEffect(() => {
    const fetchOrders = async () => {
      if (isSuperAdmin || isAdmin) {
        setOrderLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/orders`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setOrderCount(Array.isArray(data) ? data.length : 0);
          } else {
            setOrderCount(0);
          }
        } catch {
          setOrderCount(0);
        } finally {
          setOrderLoading(false);
        }
      }
    };
    fetchOrders();
  }, [isSuperAdmin, isAdmin]);

  // Fetch total orders for customers
  useEffect(() => {
    const fetchCustomerOrders = async () => {
      if (isCustomer) {
        setOrderLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/orders/myorders`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setCustomerOrderCount(Array.isArray(data) ? data.length : 0);
          } else {
            setCustomerOrderCount(0);
          }
        } catch {
          setCustomerOrderCount(0);
        } finally {
          setOrderLoading(false);
        }
      }
    };
    fetchCustomerOrders();
  }, [isCustomer]);

  // Fetch total products for admin/super admin
  useEffect(() => {
    const fetchProductCount = async () => {
      if (isSuperAdmin || isAdmin) {
        try {
          const res = await fetch(`${API_BASE_URL}/products/count`);
          if (res.ok) {
            const data = await res.json();
            setProductCount(data.count || (typeof data === 'number' ? data : 0));
          } else {
            setProductCount(0);
          }
        } catch {
          setProductCount(0);
        }
      }
    };
    fetchProductCount();
  }, [isSuperAdmin, isAdmin]);

  // Update quotes count when quotes or user changes
  useEffect(() => {
    let myQuotes = 0, myPending = 0, myCompleted = 0;
    if (user && quotes && (user.role === 'user' || user.role === 'customer')) {
      const userQuotes = quotes.filter(q => q.email === user.email);
      myQuotes = userQuotes.length;
      myPending = userQuotes.filter(q => q.status === 'Pending').length;
      myCompleted = userQuotes.filter(q => q.status === 'Completed' || q.status === 'Done').length;
    }
    setStats(prev => ({
      ...prev,
      totalQuotes: quotes ? quotes.length : 0,
      myQuotes,
      myPending,
      myCompleted,
    }));
  }, [quotes, user]);

  if (userLoading || quoteLoading || orderLoading) {
    return <Spinner />;
  }

  return (
    <>
      {(isSuperAdmin || isAdmin) ? (
        <>
          {user && (
            <div className="col-span-3 text-xl font-semibold mb-2 md:mb-2 mt-3 px-4 lg:px-5">
              <p className='font-semibold'>Welcome {user.name || user.email || 'User'}!</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <Link to="/app/allusers">
              <StatCard label="Total Users" value={stats.totalUsers} color="bg-blue-600" />
            </Link>
            <Link to="/app/allusers">
              <StatCard label="Admins" value={stats.admins} color="bg-indigo-600" />
            </Link>
            <Link to="/app/allusers">
              <StatCard label="Customers" value={stats.customers} color="bg-green-600" />
            </Link>
            <Link to="/app/products">
              <StatCard label="Total Products" value={productCount} color="bg-amber-600" />
            </Link>
            <Link to="/app/adminorderlist">
              <StatCard label="Order Received" value={orderCount} color="bg-yellow-500" />
            </Link>
            <Link to="/app/quote">
              <StatCard label="Quotes Received" value={stats.totalQuotes} color="bg-pink-600" />
            </Link>
          </div>
        </>
      ) : (user && user.role === 'customer') ? (
        <>
          <div className="col-span-3 text-xl font-semibold mb-2 md:mb-2 mt-3 px-4 lg:px-5">
            <p className='font-semibold'>Welcome {user.name || user.email || 'Customer'}!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <Link to="/app/userorderdetails">
              <StatCard label="My Orders" value={customerOrderCount} color="bg-purple-600" />
            </Link>
            <StatCard label="My Quotes" value={stats.myQuotes} color="bg-blue-600" />
            <StatCard label="Pending Quotes" value={stats.myPending} color="bg-yellow-500" />
            <StatCard label="Completed Quotes" value={stats.myCompleted} color="bg-green-600" />
          </div>
        </>
      )
       : (user && user.role === 'user') ? (
        <>
          <div className="col-span-3 text-xl font-semibold mb-2 md:mb-2 mt-3 px-4 lg:px-5">
            <p className='font-semibold'>Welcome {user.name || user.email || 'User'}!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <StatCard label="My Quotes" value={stats.myQuotes} color="bg-blue-600" />
            <StatCard label="Pending Quotes" value={stats.myPending} color="bg-yellow-500" />
            <StatCard label="Completed Quotes" value={stats.myCompleted} color="bg-green-600" />
          </div>
        </>
      ) : null
      }
    </>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-xl shadow-lg p-6 flex flex-col items-center ${color} text-white`}>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-lg font-medium">{label}</div>
    </div>
  );
}

export default DashStats;