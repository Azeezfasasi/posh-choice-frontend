import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../context-api/user-context/UseUser';
import { useCart } from '../../context-api/cart/UseCart';
import { FaSpinner, FaEdit, FaTrash, FaEye, FaSearch, FaTimes, FaCheckCircle, FaExclamationCircle, FaImage, FaDownload } from 'react-icons/fa';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../../config/api';

const AdminAllOrderMain = () => {
  const { token, user } = useUser();
  const { formatPrice } = useCart(); // Use formatPrice from cart context
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);

  // Handle PDF download
  const handleDownloadPDF = (proofUrl, orderId) => {
    const link = document.createElement('a');
    link.href = proofUrl;
    link.download = `payment-proof-${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                    <button
                      onClick={() => setSelectedOrderForDetail(order)}
                      className="text-purple-500 hover:text-purple-600 mr-3"
                    >
                      <FaEye className="inline-block" /> View
                    </button>
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

      {/* Order Detail Modal */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order Details - {selectedOrderForDetail.orderNumber}</h2>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="text-2xl hover:text-gray-200 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Name</p>
                    <p className="text-gray-900">{selectedOrderForDetail.userId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Email</p>
                    <p className="text-gray-900">{selectedOrderForDetail.userId?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Phone</p>
                    <p className="text-gray-900">{selectedOrderForDetail.userId?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Order Date</p>
                    <p className="text-gray-900">{new Date(selectedOrderForDetail.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Status</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Order Status</p>
                    <p className={`font-semibold ${
                      selectedOrderForDetail.status === 'Delivered' ? 'text-green-600' :
                      selectedOrderForDetail.status === 'Shipped' ? 'text-blue-600' :
                      selectedOrderForDetail.status === 'Processing' ? 'text-yellow-600' :
                      selectedOrderForDetail.status === 'Cancelled' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {selectedOrderForDetail.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Payment Status</p>
                    <p className={`font-semibold ${
                      selectedOrderForDetail.paymentStatus === 'Paid' ? 'text-green-600' :
                      selectedOrderForDetail.paymentStatus === 'Processing' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedOrderForDetail.paymentStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Payment Method</p>
                    <p className="text-gray-900 font-semibold">{selectedOrderForDetail.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Total Amount</p>
                    <p className="text-gray-900 font-semibold">{formatPrice(selectedOrderForDetail.totalPrice)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Proof Section - Bank Transfer */}
              {selectedOrderForDetail.paymentMethod === 'Bank Transfer' && selectedOrderForDetail.bankTransferProof && (
                <div className="border-b pb-4 bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaImage className="text-purple-500" /> Payment Proof
                  </h3>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    {selectedOrderForDetail.bankTransferProof.toLowerCase().endsWith('.pdf') ? (
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">📄</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">Payment Receipt (PDF)</p>
                          <p className="text-xs text-gray-500 mb-3">Uploaded on: {new Date(selectedOrderForDetail.paymentProofUploadedAt).toLocaleString()}</p>
                          <div className="flex gap-3 flex-wrap">
                            <a
                              href={selectedOrderForDetail.bankTransferProof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm font-medium transition"
                            >
                              <FaEye className="text-sm" /> View PDF
                            </a>
                            <button
                              onClick={() => handleDownloadPDF(selectedOrderForDetail.bankTransferProof, selectedOrderForDetail._id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition"
                            >
                              <FaDownload className="text-sm" /> Download PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <p className="text-sm text-gray-600 mb-3">Uploaded on: {new Date(selectedOrderForDetail.paymentProofUploadedAt).toLocaleString()}</p>
                        <img
                          src={selectedOrderForDetail.bankTransferProof}
                          alt="Payment Proof"
                          className="w-full max-w-sm max-h-96 rounded-md border border-gray-300 shadow-md mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items Summary */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h3>
                <div className="space-y-2 text-sm">
                  {selectedOrderForDetail.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName || item.name}</p>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Address</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                  <p>{selectedOrderForDetail.shippingAddress?.street || 'N/A'}</p>
                  <p>{selectedOrderForDetail.shippingAddress?.city || 'N/A'}, {selectedOrderForDetail.shippingAddress?.state || 'N/A'} {selectedOrderForDetail.shippingAddress?.zipCode || 'N/A'}</p>
                  <p>{selectedOrderForDetail.shippingAddress?.country || 'N/A'}</p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end gap-3">
                <Link
                  to={`/app/vieworderdetails/${selectedOrderForDetail._id}`}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium transition"
                >
                  View Full Details
                </Link>
                <button
                  onClick={() => setSelectedOrderForDetail(null)}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAllOrderMain;
