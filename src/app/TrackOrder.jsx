import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../assets/context-api/cart/UseCart';
import { FaSearch, FaSpinner, FaBoxOpen, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { API_BASE_URL } from '../config/api';
import { Helmet } from 'react-helmet';
import TopHeader from '../assets/components/TopHeader';
import MainHeader from '../assets/components/MainHeader';
import Footer from '../assets/components/Footer';

const TrackOrder = () => {
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState(null); // Stores number to fetch
  const { formatPrice } = useCart();

  // React Query to fetch public order status
  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ['publicOrder', submittedOrderNumber], // Query key depends on submitted order number
    queryFn: async () => {
      if (!submittedOrderNumber) return null; // Don't fetch if no number is submitted

      const response = await fetch(`${API_BASE_URL}/orders/public-status/${submittedOrderNumber}`, {
        // No authorization header needed for this public endpoint
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Specific message for 404 (order not found)
        if (response.status === 404) {
          throw new Error(`Order "${submittedOrderNumber}" not found. Please check the number and try again.`);
        }
        throw new Error(errorData.message || 'Failed to retrieve order status.');
      }
      return response.json();
    },
    enabled: !!submittedOrderNumber, // Only enable query when a number is submitted
    staleTime: 0, // Always refetch fresh data for public lookup
    cacheTime: 0, // Don't cache public lookup results aggressively
    retry: false, // Don't retry public lookups on error
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderNumberInput.trim()) {
      setSubmittedOrderNumber(orderNumberInput.trim());
    }
  };

  const handleClear = () => {
    setOrderNumberInput('');
    setSubmittedOrderNumber(null);
  };

  return (
    <>
    <Helmet>
        <title>Track Your Order - Posh Choice Store</title>
    </Helmet>
    <TopHeader />
    <MainHeader />
    <div className="h-screen mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Track Your Order</h1>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-col items-center gap-4 mb-6">
          <div className="relative flex-grow w-full">
            <input
              type="text"
              placeholder="Enter your Order Number (e.g., ITS013000184)"
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Order Number Input"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!orderNumberInput.trim() || isLoading}
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : 'Track Order'}
          </button>
          {submittedOrderNumber && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md transition duration-300"
            >
              <FaTimesCircle className="inline-block mr-2" /> Clear
            </button>
          )}
        </form>

        {isLoading && submittedOrderNumber && (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-purple-500 text-3xl mr-3" />
            <p className="text-lg text-gray-700">Fetching order status...</p>
          </div>
        )}

        {isError && submittedOrderNumber && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
            {/* <FaExclamationCircle className="inline-block text-xl mr-2" /> */}
            <i className="fa-solid fa-circle-exclamation inline-block text-xl mr-2"></i>
            <span className="block sm:inline">{error?.message || 'An unknown error occurred while fetching status.'}</span>
            <p className="mt-2 text-sm">Please double-check the order number or try again later.</p>
          </div>
        )}

        {order && !isLoading && !isError && (
          <div className="bg-green-50 border border-green-300 text-green-800 p-4 rounded-md text-center">
            <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">Order Found!</h2>
            <p className="text-xl font-semibold text-gray-700 mb-2">Order # {order.orderNumber}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left text-gray-700">
                <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm font-medium ${
                    order.status === 'Delivered' ? 'bg-green-200 text-green-900' :
                    order.status === 'Processing' ? 'bg-blue-200 text-blue-900' :
                    order.status === 'Shipped' ? 'bg-purple-200 text-purple-900' :
                    order.status === 'Cancelled' ? 'bg-red-200 text-red-900' :
                    'bg-gray-200 text-gray-900'
                }`}>{order.status}</span></p>
                <p><strong>Payment:</strong> <span className={`px-2 py-1 rounded text-sm font-medium ${
                    order.isPaid ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'
                }`}>{order.isPaid ? 'Paid' : 'Unpaid'}</span></p>
                <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> {formatPrice(order.totalPrice)}</p>
            </div>
            <p className="mt-4 text-sm text-gray-600 flex items-center justify-center">
                <FaInfoCircle className="mr-2" /> For more details or assistance, please contact support.
            </p>
          </div>
        )}

        {!submittedOrderNumber && !isLoading && (
          <div className="bg-purple-50 border border-purple-300 text-purple-500 p-4 rounded-md text-center">
            <FaBoxOpen className="text-purple-500 text-4xl mx-auto mb-3" />
            <p className="text-lg font-semibold">Enter an order number to check its status.</p>
            <p className="text-sm mt-2">This feature allows quick status checks without needing to log in.</p>
          </div>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default TrackOrder;
