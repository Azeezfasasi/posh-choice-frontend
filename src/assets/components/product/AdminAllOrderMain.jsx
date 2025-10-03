import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../context-api/user-context/UseUser';
import { useCart } from '../../context-api/cart/UseCart';
import { FaSpinner, FaEdit, FaTrash, FaEye, FaSearch, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../../config/api';

const AdminAllOrderMain = () => {
  const { token, user } = useUser();
  const { formatPrice } = useCart(); // Use formatPrice from cart context
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Check if the user is an admin
  const isAdmin = user && (user.role === 'admin' || user.role === 'super admin'); // Adjust based on your user role structure

  // Fetch all orders
  const { data: orders, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication token missing. Please log in.');
      }
      if (!isAdmin) {
        throw new Error('Unauthorized. You must be an administrator to view all orders.');
      }
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch orders.');
      }
      return response.json();
    },
    enabled: !!token && isAdmin, // Only run query if token and isAdmin are true
    staleTime: 60 * 1000, // Data considered fresh for 1 minute
  });

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      if (!token) {
        throw new Error('Authentication token missing.');
      }
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status.');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] }); // Invalidate to refetch updated list
      // Optionally show a success toast/message
    },
    onError: (err) => {
      console.error("Error updating order status:", err.message);
      // Optionally show an error toast/message
    },
  });

  // Mutation for deleting an order (use with caution!)
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      if (!token) {
        throw new Error('Authentication token missing.');
      }
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete order.');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      // Optionally show a success toast/message
    },
    onError: (err) => {
      console.error("Error deleting order:", err.message);
      // Optionally show an error toast/message
    },
  });

  // Mutation for updating payment status
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      if (!token) {
        throw new Error('Authentication token missing.');
      }
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update payment status.');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
    onError: (err) => {
      console.error("Error updating payment status:", err.message);
    },
  });

  // Filter and search logic
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = searchTerm ?
      (order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())) : true;

    const matchesStatus = filterStatus ? order.status === filterStatus : true;

    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-50 p-6 rounded-lg shadow-md">
        <FaSpinner className="animate-spin text-purple-500 text-4xl mr-3" />
        <p className="text-xl text-gray-700">Loading all orders...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative min-h-[60vh] flex flex-col items-center justify-center text-center">
        <FaExclamationCircle className="text-red-500 text-5xl mb-4" />
        <strong className="font-bold mb-2">Error loading orders:</strong>
        <span className="block sm:inline">{error?.message || 'An unknown error occurred.'}</span>
        <p className="mt-4 text-sm">
          Please refresh the page. If you believe this is an error, check your administrator role.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-6 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white p-8 rounded-lg shadow-xl text-gray-700">
        <FaExclamationCircle className="text-red-500 text-6xl mb-6" />
        <h2 className="text-3xl font-bold mb-3">Access Denied</h2>
        <p className="text-lg text-center mb-6">
          You do not have the necessary permissions to view this page.
        </p>
        <Link
          to="/app/dashboard" // Or redirect to home/login
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Manage Orders</h1>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search by Order#, User Name, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="w-full sm:w-1/4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        {searchTerm || filterStatus ? (
          <button
            onClick={() => { setSearchTerm(''); setFilterStatus(''); }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
          >
            <FaTimes className="mr-2" /> Clear Filters
          </button>
        ) : null}
      </div>


      {filteredOrders.length === 0 && !isLoading && !isError ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative text-center min-h-[30vh] flex items-center justify-center">
          <p>No orders found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber || order._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.userId?.name || 'N/A'} ({order.userId?.email || 'N/A'})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatPrice(order.totalPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatusMutation.mutate({ orderId: order._id, status: e.target.value })}
                      disabled={updateStatusMutation.isLoading}
                      className={`px-2 py-1 rounded-md text-sm font-semibold border ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800 border-green-300' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        order.status === 'Shipped' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-300' :
                        'bg-gray-100 text-gray-800 border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => updatePaymentStatusMutation.mutate({ orderId: order._id, status: e.target.value })}
                      disabled={updatePaymentStatusMutation.isLoading}
                      className={`px-2 py-1 rounded-md text-sm font-semibold border ${
                        order.PaymentStatus === 'Paid' ? 'bg-green-400 text-green-800 border-green-300' :
                        order.PaymentStatus === 'Processing' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        order.PaymentStatus === 'Not Paid' ? 'bg-red-100 text-red-800 border-red-300' :
                        'bg-gray-100 text-gray-800 border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      >
                        <option value="">Update Payment Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Processing">Processing</option>
                        <option value="Not Paid">Not Paid</option>
                      </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/app/vieworderdetails/${order._id}`} className="text-purple-500 hover:text-purple-600 mr-3">
                      <FaEye className="inline-block" /> View
                    </Link>
                    {/* Add delete button (use with caution in real apps, confirm delete) */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete order ${order.orderNumber}? This cannot be undone.`)) {
                          deleteOrderMutation.mutate(order._id);
                        }
                      }}
                      disabled={deleteOrderMutation.isLoading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaTrash className="inline-block" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAllOrderMain;
