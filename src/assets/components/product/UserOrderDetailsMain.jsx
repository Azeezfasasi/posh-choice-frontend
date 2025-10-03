import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '../../context-api/user-context/UseUser';
import { useCart } from '../../context-api/cart/UseCart';
import { FaSpinner, FaShoppingCart, FaCheckCircle, FaExclamationCircle, FaEye } from 'react-icons/fa';
import { API_BASE_URL } from '../../../config/api';
// import { User } from 'lucide-react';

  const UserOrderDetailsMain = () => {
  const { token, user } = useUser();
  const { formatPrice } = useCart(); // Use formatPrice from cart context

  // Fetch logged-in user's orders using React Query
  const { data: orders, isLoading, isError, error } = useQuery({
    queryKey: ['myOrders'], // Unique key for this query
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication token missing. Please log in.');
      }
      const response = await fetch(`${API_BASE_URL}/orders/myorders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch your orders.');
      }
      return response.json();
    },
    enabled: !!token, // Only run query if token is available
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    retry: 1, // Retry once on failure
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-50 p-6 rounded-lg shadow-md">
        <FaSpinner className="animate-spin text-purple-500 text-4xl mr-3" />
        <p className="text-xl text-gray-700">Loading your order history...</p>
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
          Please try again. If the issue persists, ensure you are logged in.
        </p>
        <Link
          to="/app/login"
          className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full transition duration-300"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white p-8 rounded-lg shadow-xl text-gray-700">
        <FaExclamationCircle className="text-red-500 text-6xl mb-6" />
        <h2 className="text-3xl font-bold mb-3">Authentication Required</h2>
        <p className="text-lg text-center mb-6">
          Please log in to view your order history.
        </p>
        <Link
          to="/app/login"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white p-8 rounded-lg shadow-xl text-gray-700">
        <FaShoppingCart className="text-gray-400 text-6xl mb-6" />
        <h2 className="text-3xl font-bold mb-3">No Orders Found</h2>
        <p className="text-lg text-center mb-6">
          It looks like you haven't placed any orders yet. Start shopping!
        </p>
        <Link
          to="/app/shop"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Your Orders</h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber || order._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                    {order.isPaid ? (
                      <span className="ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    ) : (
                      <span className="ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Unpaid
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/app/viewuserorderdetails/${order._id}`}
                      className="text-purple-600 hover:text-purple-900"
                      title="View Order Details"
                    >
                      <FaEye className="inline-block mr-1" /> View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetailsMain;
