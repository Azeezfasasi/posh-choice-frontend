import React from 'react';

const ProductFilter = ({ filter, setFilter }) => {
  return (
    <div className="flex flex-row justify-center flex-wrap gap-3 items-center mb-6">
      <label className="font-medium text-gray-700">Sort by:</label>
      <select
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="recent">Recent Products</option>
        <option value="low-to-high">Price: Low to High</option>
        <option value="high-to-low">Price: High to Low</option>
        <option value="discount">Biggest Discount</option>
        <option value="popular">Most Popular</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
  );
};

export default ProductFilter;
