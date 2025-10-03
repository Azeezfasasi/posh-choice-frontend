import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProduct } from '../../context-api/product-context/UseProduct';
import { FaEdit, FaTrash, FaPlus, FaChevronRight, FaChevronDown, FaSearch } from 'react-icons/fa';

const CategoryList = () => {
  const { 
    categories, 
    fetchCategories, 
    deleteCategory,
    loading, 
    error, 
    success 
  } = useProduct();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm) {
      // Flat search across all categories
      const filtered = categories.filter(
        cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      // Show full hierarchical structure
      const roots = categories.filter(cat => !cat.parent);
      setFilteredCategories(roots);
    }
  }, [categories, searchTerm]);

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete._id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const getChildCategories = (parentId) => {
    return categories.filter(cat => cat.parent === parentId);
  };

  const renderCategoryItem = (category, level = 0) => {
    const hasChildren = categories.some(cat => cat.parent === category._id);
    const isExpanded = expandedCategories[category._id];
    const childCategories = getChildCategories(category._id);
    
    return (
      <div key={category._id} className="category-item">
        <div 
          className={`flex items-center p-3 hover:bg-gray-50 border-b ${level > 0 ? 'pl-8' : ''}`}
          style={{ paddingLeft: `${(level * 1.5) + 1}rem` }}
        >
          {hasChildren && (
            <button 
              onClick={() => toggleExpand(category._id)}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
            </button>
          )}
          {!hasChildren && <div className="w-5 mr-2"></div>}
          {/* Category image */}
          <img
            src={category.image || '/placehold.co/40x40/CCCCCC/000000?text=No+Image'}
            alt={category.name}
            className="w-8 h-8 object-cover rounded-full border border-solid border-gray-400 mr-3"
            style={{ minWidth: 32, minHeight: 32 }}
          />
          <div className="flex-grow">
            <div className="font-medium">{category.name}</div>
            {category.description && (
              <div className="text-sm text-gray-500 truncate">{category.description}</div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!category.isActive && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                Inactive
              </span>
            )}
            
            <Link 
              to={`/app/editproductcategories/${category._id}`}
              className="text-purple-500 hover:text-purple-600 p-2"
            >
              <FaEdit size={16} />
            </Link>
            
            <button
              onClick={() => handleDeleteClick(category)}
              className="text-red-600 hover:text-red-900 p-2"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="pl-4">
            {childCategories.map(child => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
        <Link 
          to="/app/addproductcategory" 
          className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add New Category
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
          {success}
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm 
            ? `No categories found matching "${searchTerm}"` 
            : 'No categories found. Create your first category!'}
        </div>
      ) : (
        <div className="border border-solid border-gray-400 rounded-md">
          <div className="bg-blue-200 p-3 border-b border-solid border-gray-400 font-medium text-gray-700 flex items-center">
            <div className="w-5 mr-2"></div>
            <div>Category Name</div>
          </div>
          <div className="">
            {searchTerm 
              ? filteredCategories.map(category => renderCategoryItem(category)) 
              : filteredCategories.map(category => renderCategoryItem(category))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;