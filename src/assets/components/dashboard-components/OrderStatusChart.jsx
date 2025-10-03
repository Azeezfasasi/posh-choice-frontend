import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaChartPie, FaSync } from 'react-icons/fa';
import { API_BASE_URL } from '../../../config/api';

const STATUS_COLORS = {
  'Pending': '#f59e0b',    // Yellow/amber
  'Processing': '#3b82f6',  // Blue
  'Shipped': '#8b5cf6',     // Purple
  'Delivered': '#10b981',   // Green
  'Cancelled': '#ef4444'    // Red
};

export default function OrderStatusChart() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch orders from backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Adjust if you use a different auth method
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.log(err);
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Calculate status distribution
  const statusData = Object.entries(
    orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">
            Count: <span className="font-semibold">{payload[0].value}</span>
          </p>
          <p className="text-sm">
            Percentage: <span className="font-semibold">
              {orders.length ? Math.round((payload[0].value / orders.length) * 100) : 0}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full mx-auto p-6 bg-white shadow-md rounded-2xl dark:bg-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Order Status Distribution
        </h2>
        <button 
          onClick={handleRefresh}
          className={`p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 ${isRefreshing ? 'animate-spin' : ''}`}
          disabled={loading || isRefreshing}
          title="Refresh data"
        >
          <FaSync />
        </button>
      </div>

      {loading && !isRefreshing ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No order data available
        </div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {statusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.name] || '#cbd5e1'} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-xs text-gray-600">{status}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {statusData.map((item) => (
                <div key={item.name} className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold">{item.value}</div>
                  <div className="text-xs text-gray-500 truncate" title={item.name}>{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}