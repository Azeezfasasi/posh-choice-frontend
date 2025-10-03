import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../../context-api/product-context/UseProduct'
import { FaSave, FaArrowLeft, FaTrash } from 'react-icons/fa'; 
import { RICHT_TEXT_API } from '../../../config/richText';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import back from '../../images/back.svg';
import { Link } from 'react-router-dom';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    product,
    fetchProductById,
    loading,
    error,  
    success, 
    categories, fetchCategories
  } = useProduct();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    richDescription: '',
    brand: '',
    price: '',
    originalPrice: '',
    category: '', // This will be category ID
    stockQuantity: '',
    colors: [],   // Now an array
    sizes: [],    // Now an array
    tags: [],     // Now an array
    status: 'draft',
    isFeatured: false,
    onSale: false, // Corrected from isOnSale to onSale to match backend schema
    discountPercentage: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    // No need for categoryId or userId in formData for update, backend uses token
  });

  const [imageFiles, setImageFiles] = useState([]); // For newly selected image files
  const [currentImages, setCurrentImages] = useState([]); // To manage existing images (url and public_id)
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]); // fetchCategories is stable due to useCallback in ProductProvider

  // Fetch product data for editing
  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]); // fetchProductById is stable due to useCallback

  // Populate form data when product is loaded
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        richDescription: product.richDescription || '',
        brand: product.brand || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        category: product.category?._id || '', // Use category._id
        stockQuantity: product.stockQuantity || '',
        colors: Array.isArray(product.colors) ? product.colors : (product.colors ? product.colors.split(',').map(s => s.trim()).filter(s => s !== '') : []),
        sizes: Array.isArray(product.sizes) ? product.sizes : (product.sizes ? product.sizes.split(',').map(s => s.trim()).filter(s => s !== '') : []),
        tags: Array.isArray(product.tags) ? product.tags : (product.tags ? product.tags.split(',').map(s => s.trim()).filter(s => s !== '') : []),
        sku: product.sku || '',
        weight: product.weight || '',
        dimensions: {
          length: product.dimensions?.length || '',
          width: product.dimensions?.width || '',
          height: product.dimensions?.height || ''
        },
        status: product.status || 'draft',
        isFeatured: product.isFeatured || false,
        onSale: product.onSale || false, // Ensure this matches backend
        discountPercentage: product.discountPercentage || '',
      });
      // Set current images for display and deletion management
      setCurrentImages(product.images || []);
      setImageFiles([]); // Clear any previously selected new files
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle checkboxes
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
    // Handle nested dimensions object
    else if (name.startsWith('dimensions.')) {
      const dimKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimKey]: value,
        },
      }));
    }
    // Handle array fields (colors, sizes, tags) - convert comma-separated string to array
    else if (['colors', 'sizes', 'tags'].includes(name)) {
        setFormData(prev => ({
            ...prev,
            [name]: value.split(',').map(item => item.trim()).filter(item => item !== '')
        }));
    }
    // Handle all other input types
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleDeleteExistingImage = (imageToDeleteUrl) => {
    setCurrentImages(prevImages => prevImages.filter(img => img.url !== imageToDeleteUrl));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.description.trim()) errors.description = 'Product description is required';
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) errors.price = 'Valid price is required';
    if (!formData.stockQuantity || isNaN(formData.stockQuantity) || Number(formData.stockQuantity) < 0) errors.stockQuantity = 'Valid stock quantity is required';
    if (!formData.category) errors.category = 'Category is required';

    // Optional validation for richDescription if needed
    // if (!formData.richDescription.trim()) errors.richDescription = 'Rich description is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // React Query mutation for updating product
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, dataToSend }) => {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/products/${id}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', id]);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    const dataToSend = new FormData();
    // Append all text fields
    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        if (key === 'dimensions') {
          if (formData.dimensions.length !== '') dataToSend.append('dimensions.length', Number(formData.dimensions.length));
          if (formData.dimensions.width !== '') dataToSend.append('dimensions.width', Number(formData.dimensions.width));
          if (formData.dimensions.height !== '') dataToSend.append('dimensions.height', Number(formData.dimensions.height));
        } else if (key === 'discountPercentage') {
          // Only append if it's a valid number and not empty
          if (
            formData.discountPercentage !== '' &&
            !isNaN(Number(formData.discountPercentage)) &&
            formData.discountPercentage !== null &&
            formData.discountPercentage !== undefined
          ) {
            dataToSend.append('discountPercentage', Number(formData.discountPercentage));
          }
        } else if (Array.isArray(formData[key])) {
          // Send as comma-separated string for colors, sizes, tags
          dataToSend.append(key, formData[key].join(','));
        } else if (typeof formData[key] === 'boolean') {
          dataToSend.append(key, formData[key] ? 'true' : 'false');
        } else if (formData[key] !== null && formData[key] !== undefined && key !== 'discountPercentage') {
          dataToSend.append(key, formData[key]);
        }
      }
    }
    // Append new image files if any
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        dataToSend.append('images', file);
      });
    }
    // Only append existingImageUrls if editing and there are existing images
    if (currentImages && currentImages.length > 0 && id) {
      dataToSend.append('existingImageUrls', JSON.stringify(currentImages.map(img => ({ url: img.url, public_id: img.public_id }))));
    }

    // Debug: log all FormData
    console.log('FormData being sent:');
    for (let pair of dataToSend.entries()) {
      console.log(pair[0], pair[1]);
    }

    updateProductMutation.mutate(
      { id, dataToSend },
      {
        onSuccess: () => {
          setTimeout(() => {
            navigate('/app/products');
          }, 1500);
        },
        onError: (err) => {
          setValidationErrors({ submit: err?.response?.data?.error || err.message || 'Failed to update product. Please try again.' });
        }
      }
    );
  };

  // Base URL for Cloudinary images (assuming your backend serves them directly or via a proxy)
  const API_URL_BASE = import.meta.env.VITE_API_URL;

  const editorRef = useRef(null);
  const handleEditorChange = (content) => {
    setFormData({ ...formData, description: content });
  };

  return (
    <div className='max-w-4xl mx-auto p-4 bg-white rounded-md shadow-md'>
      <Link to="/app/products" className='flex flex-row justify-start mb-6'>
          <img src={back} alt="Back" className='w-7 h-7 mr-2' /><p className='font-semibold'>Back to Products</p>
      </Link>
      <h2 className='text-2xl font-bold mb-4'>Edit Product: <span className='text-purple-500'>{product?.name || 'Loading...'}</span></h2>

      {loading && <p className="text-purple-500 mb-4">Loading product data...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}
      {updateProductMutation.isError && (
        <p className="text-red-600 mb-4">{updateProductMutation.error?.response?.data?.error || updateProductMutation.error?.message}</p>
      )}

      {(!product && !loading) ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Product not found or an error occurred.</p>
          <button
            onClick={() => navigate('/app/products')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Go Back to Products
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-15 lg:6">
          {/* Name and Description */}
          <div>
            <label htmlFor="name" className='block text-sm font-medium text-gray-700 mb-1'>Product Name<span className='text-red-700'>*</span></label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              name="name"
              className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
            />
            {validationErrors.name && <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="description" className='block text-sm font-medium text-gray-700 mb-1'>Description<span className='text-red-700'>*</span></label>
            <Editor
              apiKey={RICHT_TEXT_API}
              onInit={(evt, editor) => (editorRef.current = editor)}
              value={formData.richDescription || formData.description}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks |' + 'bold italic forecolor | alignleft aligncenter alignright alignjustify |' + '| bullist numlist outdent indent | ' + 'removeformat | help',
              }}
              onEditorChange={handleEditorChange}
            />
            {validationErrors.description && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
            )}
          </div>

          {/* Brand, Price, Discounted Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className='text-purple-500'>(Optional)</span>
              </label>
              <input
                type="text"
                id="brand"
                value={formData.brand}
                onChange={handleChange}
                name="brand"
                className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
              />
            </div>
            <div>
              <label htmlFor="price" className='block text-sm font-medium text-gray-700 mb-1'>Price<span className='text-red-700'>*</span></label>
              <input
                type="number" 
                id="price"
                value={formData.price}
                onChange={handleChange}
                name="price"
                step="0.01"
                min="0"
                className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
              />
              {validationErrors.price && <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>}
            </div>
            {/* <div>
              <label htmlFor="originalPrice" className='block text-sm font-medium text-gray-700 mb-1'>Disconted Price <span className='text-[12px] text-purple-600 font-semibold'>(Optional - Must be less than original price)</span></label>
              <input
                type="number" // Changed to number type
                id="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                name="originalPrice"
                step="0.01"
                min="0"
                className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
              />
            </div> */}
            <div>
              <label htmlFor="discountPercentage" className='block text-sm font-medium text-gray-700 mb-1'>Discount Percentage (%) <span className='text-purple-500'>(Optional)</span></label>
              <input
                type="number"
                id="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                name="discountPercentage"
                min="0"
                max="100"
                className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
              />
            </div>
          </div>

          {/* Category, Stock, SKU */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className='block text-sm font-medium text-gray-700 mb-1'>Category<span className='text-red-700'>*</span></label>
              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
              >
                <option value="">Choose Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {validationErrors.category && <p className="text-red-500 text-sm mt-1">{validationErrors.category}</p>}
            </div>
            <div>
              <label htmlFor="stockQuantity" className='block text-sm font-medium text-gray-700 mb-1'>Stock Quantity<span className='text-red-700'>*</span></label>
              <input
                type="number" // Changed to number type
                id="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                name="stockQuantity"
                min="0"
                className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
              />
              {validationErrors.stockQuantity && <p className="text-red-500 text-sm mt-1">{validationErrors.stockQuantity}</p>}
            </div>
            <div>
              <label htmlFor="sku" className='block text-sm font-medium text-gray-700 mb-1'>SKU<span className='text-red-700'>* <span className='text-purple-500'>(This will be generated automatically)</span></span></label>
              <input
                type="text"
                id="sku"
                value={formData.sku}
                onChange={handleChange}
                name="sku"
                readOnly
                className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
              />
            </div>
          </div>

          {/* Colors, Sizes, Tags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="colors" className='block text-sm font-medium text-gray-700 mb-1'>Colors <span className='text-purple-500'>(Optional - Separate each with a comma)</span></label>
              <input
                type="text"
                id="colors"
                value={Array.isArray(formData.colors) ? formData.colors.join(', ') : formData.colors || ''} // Ensure it handles string or array initially
                onChange={handleChange}
                name="colors"
                className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
                placeholder="e.g., Red, Blue, Black"
              />
            </div>
            <div>
                <label htmlFor="colors" className='block text-sm font-medium text-gray-700 mb-1'>Sizes <span className='text-purple-500'>(Optional - Separate each with a comma)</span></label>
              <input
                type="text"
                id="sizes"
                value={Array.isArray(formData.sizes) ? formData.sizes.join(', ') : formData.sizes || ''} // Ensure it handles string or array initially
                onChange={handleChange}
                name="sizes"
                className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
                placeholder="e.g., S, M, L, XL"
              />
            </div>
            <div>
              <label htmlFor="tags" className='block text-sm font-medium text-gray-700 mb-1'>Tags <span className='text-purple-500'>(Optional - Separate each with a comma)</span></label>
              <input
                type="text"
                id="tags"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''} // Ensure it handles string or array initially
                onChange={handleChange}
                name="tags"
                className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
                placeholder="e.g., electronics, new, durable"
              />
            </div>
          </div>

          {/* Weight and Dimensions */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Physical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="weight" className='block text-sm font-medium text-gray-700 mb-1'>Weight (kg) <span className='text-purple-500'>(Optional)</span></label>
                <input
                  type="number"
                  id="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  name="weight"
                  step="0.01"
                  min="0"
                  className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
                />
              </div>
              <div>
                <label htmlFor="dimensions.length" className='block text-sm font-medium text-gray-700 mb-1'>Length (cm) <span className='text-purple-500'>(Optional)</span></label>
                <input
                  type="number"
                  id="dimensions.length"
                  value={formData.dimensions.length}
                  onChange={handleChange}
                  name="dimensions.length"
                  step="0.01"
                  min="0"
                  className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
                />
              </div>
              <div>
                <label htmlFor="dimensions.width" className='block text-sm font-medium text-gray-700 mb-1'>Width (cm) <span className='text-purple-500'>(Optional)</span></label>
                <input
                  type="number"
                  id="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleChange}
                  name="dimensions.width"
                  step="0.01"
                  min="0"
                  className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
                />
              </div>
              <div>
                <label htmlFor="dimensions.height" className='block text-sm font-medium text-gray-700 mb-1'>Height (cm) <span className='text-purple-500'>(Optional)</span></label>
                <input
                  type="number"
                  id="dimensions.height"
                  value={formData.dimensions.height}
                  onChange={handleChange}
                  name="dimensions.height"
                  step="0.01"
                  min="0"
                  className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Image Management */}
          <div>
            <label htmlFor="images" className='block text-lg font-medium mb-2'>Product Images: <br /><span className='text-purple-500 text-[13px]'>You can add up to 10 new images or remove existing ones.</span></label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              accept="image/*"
            />
            <p className="mt-1 text-sm text-gray-500">Upload new images (max 10MB each).</p>

            {/* Display newly selected images (before upload) */}
            {imageFiles.length > 0 && (
              <div className="mt-3">
                <p className="text-md font-medium text-gray-700">New images to upload:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                      <img src={URL.createObjectURL(file)} alt={`New Image ${index}`} className="w-full h-full object-cover" />
                      {/* No delete here, as these are not yet uploaded */}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display existing product images */}
            {currentImages.length > 0 && (
              <div className="mt-4">
                <p className="text-md font-medium text-purple-500">Current product images:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentImages.map((image, index) => (
                    <div key={image.url} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                      <img src={image.url} alt={`Existing Image ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(image.url)}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-bl-md p-1 text-xs opacity-80 hover:opacity-100 transition-opacity"
                        title="Remove this image"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(currentImages.length === 0 && product?.images?.length > 0) && (
              <p className="text-purple-500 text-sm mt-2">All original images have been marked for removal. Add new ones or they will be deleted upon save.</p>
            )}
          </div>

          {/* Status and Feature/Sale Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className='block text-lg font-medium mb-2'>Status:</label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center space-x-4 mt-8 md:mt-auto">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isFeatured"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">Is Featured?</label>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="onSale"
                        name="onSale"
                        checked={formData.onSale}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="onSale" className="ml-2 block text-sm text-gray-900">Is On Sale?</label>
                </div>
            </div>
          </div>


          {/* Action Buttons */}
          <div className='flex flex-row justify-start items-center gap-5 mt-6'>
            <button
              type="submit"
              className="flex justify-center items-center gap-3 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring focus:ring-purple-500 w-[200px] cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/products')}
              className="flex justify-center items-center gap-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md focus:outline-none focus:ring focus:ring-gray-500 w-[200px] cursor-pointer"
            >
              <FaArrowLeft /> Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditProduct;