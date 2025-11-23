import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '../../context-api/user-context/UseUser';
import { API_BASE_URL } from '../../../config/api';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaImage } from 'react-icons/fa';
import back from '../../images/back.svg';

const fetchUserOrderById = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch order details.');
  }
  return response.json();
};

function ViewUserOrderDetailsMain() {
  const { id } = useParams();
  const { token } = useUser();
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userOrderDetails', id],
    queryFn: () => fetchUserOrderById(id, token),
    enabled: !!id && !!token,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4" />
        <p className="text-xl text-gray-700">Loading your order details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative min-h-[60vh] flex flex-col items-center justify-center text-center">
        <FaTimesCircle className="text-red-500 text-5xl mb-4" />
        <strong className="font-bold mb-2">Error loading order details:</strong>
        <span className="block sm:inline">{error?.message || 'An unknown error occurred.'}</span>
        <button
          onClick={() => refetch()}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full transition duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center text-gray-600 py-12">Order not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-8">
        <Link to="/app/userorderdetails" className='flex flex-row justify-start mb-6'>
            <img src={back} alt="Back" className='w-7 h-7 mr-2' /><p className='font-semibold'>Back to Orders</p>
        </Link>
      <h2 className="text-3xl font-bold mb-6 text-center">Order Details</h2>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between">
        <div>
          <p className="text-lg font-semibold">Order #: <span className="font-normal">{order.orderNumber}</span></p>
          <p className="text-lg font-semibold">Status: <span className={`font-bold ml-2 ${order.status === 'Delivered' ? 'text-green-600' : order.status === 'Cancelled' ? 'text-red-600' : 'text-blue-600'}`}>{order.status}</span></p>
          <p className="text-lg font-semibold">Date: <span className="font-normal">{new Date(order.createdAt).toLocaleString()}</span></p>
        </div>
        <div className="mt-4 sm:mt-0">
          <p className="text-lg font-semibold">Shipping To:</p>
          <p>{order.shippingAddress.fullName}</p>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Shipping Address</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p>{order.shippingAddress.address1}{order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ''}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zipCode}</p>
          <p>{order.shippingAddress.country}</p>
          {order.shippingAddress.note && <p className="italic text-gray-500 mt-1">Note: {order.shippingAddress.note}</p>}
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.orderItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 flex items-center gap-2">
                    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />}
                    <span>{item.name}</span>
                  </td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">₦{item.price.toLocaleString()}</td>
                  <td className="px-4 py-2 font-semibold">₦{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold mb-2">Payment</h3>
          <p>Method: <span className="font-semibold">{order.paymentMethod}</span></p>
          <p>Status: {order.isPaid ? <span className="text-green-600 font-bold flex items-center"><FaCheckCircle className="mr-1" /> Paid</span> : <span className="text-red-600 font-bold flex items-center"><FaTimesCircle className="mr-1" /> Not Paid</span>}</p>
          {order.paidAt && <p>Paid At: {new Date(order.paidAt).toLocaleString()}</p>}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Summary</h3>
          <p>Items: <span className="font-semibold">₦{order.itemsPrice?.total?.toLocaleString() || order.itemsPrice?.toLocaleString() || '0'}</span></p>
          <p>Tax: <span className="font-semibold">₦{order.taxPrice?.toLocaleString() || '0'}</span></p>
          <p>Shipping: <span className="font-semibold">₦{order.shippingPrice?.toLocaleString() || '0'}</span></p>
          <p className="text-lg font-bold mt-2">Total: <span className="text-blue-700">₦{order.totalPrice?.toLocaleString() || '0'}</span></p>
        </div>
      </div>

      {/* Bank Transfer Payment Proof */}
      {order.paymentMethod === 'Bank Transfer' && order.bankTransferProof && (
        <div className="mb-6 border-t pt-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaImage className="text-purple-500" /> Payment Proof
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {order.bankTransferProof.toLowerCase().endsWith('.pdf') ? (
              <div className="flex items-center gap-4">
                <div className="text-4xl">📄</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Payment Receipt (PDF)</p>
                  <a
                    href={order.bankTransferProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 hover:underline text-sm"
                  >
                    View PDF
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-2">Uploaded on: {new Date(order.paymentProofUploadedAt).toLocaleString()}</p>
                <img
                  src={order.bankTransferProof}
                  alt="Payment Proof"
                  className="max-w-xs max-h-96 rounded-md border border-gray-300"
                />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-between mt-8">
        <Link to="/app/userorderdetails" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-full transition duration-300">Back to My Orders</Link>
      </div>
    </div>
  );
}

export default ViewUserOrderDetailsMain;