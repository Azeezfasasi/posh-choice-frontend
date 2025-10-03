import { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, XAxis,
  YAxis, CartesianGrid
} from 'recharts';
import { FaChartPie, FaChartBar, FaSync } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../../config/api';

const CATEGORY_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function ProductChart() {
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    select: (data) => Array.isArray(data?.data) ? data.data : [],
  });

  const [activeChart, setActiveChart] = useState('pie');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Group products by category name
  const categoryData = Object.entries(
    products.reduce((acc, product) => {
      const categoryName = product?.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {})
  ).map(([categoryName, value]) => ({ categoryName, value }));

  const topCategories = [...categoryData].sort((a, b) => b.value - a.value).slice(0, 5);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { categoryName, value } = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-medium">{categoryName}</p>
          <p className="text-sm">Count: <span className="font-semibold">{value}</span></p>
          <p className="text-sm">Percentage: <span className="font-semibold">
            {Math.round((value / products.length) * 100)}%
          </span></p>
        </div>
      );
    }
    return null;
  };

  const getCurrentData = () => (activeChart === 'pie' ? categoryData : topCategories);

  return (
    <div className="w-full mx-auto p-6 bg-white shadow-md rounded-2xl dark:bg-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {activeChart === 'pie' ? 'Product Categories Distribution' : 'Top Product Categories'}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveChart('pie')}
            className={`p-2 rounded-md ${activeChart === 'pie'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="Show pie chart"
          >
            <FaChartPie />
          </button>
          <button
            onClick={() => setActiveChart('bar')}
            className={`p-2 rounded-md ${activeChart === 'bar'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="Show bar chart"
          >
            <FaChartBar />
          </button>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 ${isRefreshing ? 'animate-spin' : ''}`}
            disabled={isLoading || isRefreshing}
            title="Refresh data"
          >
            <FaSync />
          </button>
        </div>
      </div>

      {isLoading && !isRefreshing ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No product data available
        </div>
      ) : (
        <div className="chart-container">
          {activeChart === 'pie' ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                  label={({ categoryName, percent }) => `${categoryName}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCategories} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryName" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6">
                  {topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {getCurrentData().map((item) => (
                <div key={item.categoryName} className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold">{item.value}</div>
                  <div className="text-xs text-gray-500 truncate" title={item.categoryName}>
                    {item.categoryName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
