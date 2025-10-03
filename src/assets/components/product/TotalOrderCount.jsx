import { useQuery } from '@tanstack/react-query';
import { useUser } from '../../context-api/user-context/UseUser';
import { FaSpinner, FaBoxes, FaExclamationCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../../config/api';

const TotalOrdersCount = () => {
  const { token } = useUser();

  // Fetch all orders to get the total count
  const { data: orders } = useQuery({
    queryKey: ['allOrdersCount'], // A unique key for this query
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication token missing. Please log in.');
      }
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch total orders count.');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const totalOrders = orders ? orders.length : 0;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center text-center h-full">
      <FaBoxes className="text-blue-500 text-5xl mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Orders</h2>
      <p className="text-5xl font-extrabold text-gray-900 leading-tight">{totalOrders}</p>
      <Link to="/app/admin/orders" className="mt-4 text-blue-600 hover:underline text-sm">
        View All Orders
      </Link>
    </div>
  );
};

export default TotalOrdersCount;
