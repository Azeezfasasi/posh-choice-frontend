import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../../context-api/product-context/UseProduct';
import { FaSave, FaArrowLeft, FaUpload, FaImage, FaTimes } from 'react-icons/fa';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const {
    fetchCategoryById,
    fetchCategories,
    createCategory,
    updateCategory,
    error,
    success,
    categories
  } = useProduct();

  // Use a local loading state instead of global context loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    sortOrder: 0,
    isActive: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Load all categories for parent dropdown
    fetchCategories();
    
    // If in edit mode, load category data
    if (isEditMode) {
      const loadCategory = async () => {
        const categoryData = await fetchCategoryById(id);
        if (categoryData) {
          setFormData({
            name: categoryData.name || '',
            description: categoryData.description || '',
            parent: categoryData.parent?._id || '',
            sortOrder: categoryData.sortOrder || 0,
            isActive: categoryData.isActive !== false
          });
          
          if (categoryData.image) {
            setImagePreview(categoryData.image.startsWith('http') 
                ? categoryData.image 
                : `${import.meta.env.VITE_API_URL || ''}${categoryData.image}`);
          }
        }
      };
      
      loadCategory();
    }
  }, [isEditMode, id, fetchCategoryById, fetchCategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear validation error when field is changed
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setValidationErrors(prev => ({
        ...prev,
        image: 'Please select an image file'
      }));
      return;
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    
    // Clear validation error
    if (validationErrors.image) {
      setValidationErrors(prev => ({
        ...prev,
        image: null
      }));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    // Validate that parent is not the same as the category being edited
    if (isEditMode && formData.parent === id) {
      errors.parent = 'A category cannot be its own parent';
    }
    
    return errors;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate form
  const errors = validateForm();
  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    window.scrollTo(0, 0);
    return;
  }
  
  // Set local loading state
  setIsSubmitting(true);
  
  try {
    // Prepare form data for submission
    const categoryFormData = {
      ...formData,
      image: imageFile
    };
    
    // Log the form data for debugging
    console.log('Form data being submitted:', categoryFormData);
    
    let result;
    if (isEditMode) {
      result = await updateCategory(id, categoryFormData);
    } else {
      result = await createCategory(categoryFormData);
    }
    
    if (result) {
      // Navigate to category list on success after a short delay
      setTimeout(() => {
        // Make sure both navigation paths are consistent
        navigate('/app/productcategories');
      }, 1500);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  } finally {
    setIsSubmitting(false);
  }
};

  // Get the correct return path (use the same path for all navigation)
  const returnPath = '/app/productcategories';

  // Filter out the current category from parent options to prevent circular reference
  const parentOptions = categories.filter(cat => !isEditMode || cat._id !== id);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(returnPath)}
          className="text-purple-500 hover:text-purple-600 mr-4 cursor-pointer"
        >
          <FaArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Category' : 'Add New Category'}
        </h2>
      </div>

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          <h3 className="font-medium mb-2">Please fix the following errors:</h3>
          <ul className="list-disc list-inside">
            {Object.entries(validationErrors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* API Errors */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
            {validationErrors.name && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-1">
              Parent Category
            </label>
            <select
              id="parent"
              name="parent"
              value={formData.parent}
              onChange={handleChange}
              className={`w-full border ${validationErrors.parent ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="">None (Top Level)</option>
              {parentOptions.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {validationErrors.parent && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.parent}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <input
              type="number"
              id="sortOrder"
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-gray-500 text-xs mt-1">Lower numbers appear first</p>
          </div>
          
          <div className="flex items-center pt-7">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          ></textarea>
        </div>
        
        {/* Category Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Image
          </label>
          
          {imagePreview ? (
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Category preview" 
                className="h-32 w-32 object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <div className="flex justify-center">
                <FaImage className="text-gray-400 text-4xl mb-3" />
              </div>
              <p className="text-gray-500 mb-2">Click to upload category image</p>
              <p className="text-xs text-gray-400 mb-4">PNG, JPG, GIF up to 2MB</p>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              <label
                htmlFor="image"
                className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 cursor-pointer"
              >
                <FaUpload className="mr-2" />
                Select Image
              </label>
            </div>
          )}
          
          {validationErrors.image && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.image}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(returnPath)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-purple-500 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                {isEditMode ? 'Update Category' : 'Create Category'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;