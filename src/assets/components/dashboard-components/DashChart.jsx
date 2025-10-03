import { useState, useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { QuoteContext } from '../../context-api/Request-quote-context/QuoteContext';
import { FaChartPie, FaChartBar, FaSync } from 'react-icons/fa';

const SERVICE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const STATUS_COLORS = {
  'Pending': '#f59e0b',    // Yellow/amber
  'In Review': '#3b82f6',  // Blue
  'Done': '#8b5cf6',       // Purple
  'Completed': '#10b981',  // Green
  'Rejected': '#ef4444'    // Red
};

export default function DashChart() {
  const { quotes, fetchQuotes, loading } = useContext(QuoteContext);
  const [activeChart, setActiveChart] = useState('status');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate status distribution
  const statusData = Object.entries(
    quotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Calculate service distribution
  const serviceData = Object.entries(
    quotes.reduce((acc, quote) => {
      acc[quote.service] = (acc[quote.service] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Get top 5 services by count
  const topServices = [...serviceData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchQuotes();
    setTimeout(() => setIsRefreshing(false), 500); // Ensure animation plays
  };

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
              {Math.round((payload[0].value / quotes.length) * 100)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Get current data based on active chart
  const getCurrentData = () => {
    return activeChart === 'status' ? statusData : topServices;
  };

  return (
    <div className="w-full mx-auto p-6 bg-white shadow-md rounded-2xl dark:bg-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {activeChart === 'status' ? 'Quote Status Distribution' : 'Top Services Requested'}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveChart('status')}
            className={`p-2 rounded-md ${
              activeChart === 'status' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Show status distribution"
          >
            <FaChartPie />
          </button>
          <button 
            onClick={() => setActiveChart('service')}
            className={`p-2 rounded-md ${
              activeChart === 'service' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Show service distribution"
          >
            <FaChartBar />
          </button>
          <button 
            onClick={handleRefresh}
            className={`p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 ${isRefreshing ? 'animate-spin' : ''}`}
            disabled={loading || isRefreshing}
            title="Refresh data"
          >
            <FaSync />
          </button>
        </div>
      </div>

      {loading && !isRefreshing ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : quotes.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No quote data available
        </div>
      ) : (
        <div className="chart-container">
          {activeChart === 'status' ? (
            <div>
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
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topServices}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8884d8">
                  {topServices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {getCurrentData().map((item) => (
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