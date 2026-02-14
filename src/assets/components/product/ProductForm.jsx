import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../../context-api/product-context/UseProduct';
import { FaImage, FaUpload, FaTimes, FaSave, FaArrowLeft } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { RICHT_TEXT_API } from '../../../config/richText';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const {
    fetchProductById,
    fetchCategories,
    createProduct,
    updateProduct,
    loading,
    error,
    success
  } = useProduct();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    richDescription: '',
    brand: '',
    price: '',
    originalPrice: '',
    category: '',
    stockQuantity: '',
    colors: '',
    sizes: '',
    tags: '',
    status: 'published',
    isFeatured: false,
    isOnSale: false,
    discountPercentage: '',
    sku: uuidv4(),
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    shippingClass: 'standard',
    taxClass: 'standard'
  });

  //  const handleGenerateSku = () => {
  //   const sku = `${formData.brand}-${formData.name}-${formData.colors}`;
  //   setFormData({ ...formData, sku });
  // };

  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // Load product data if in edit mode
  useEffect(() => {
    const loadData = async () => {
      // Load categories regardless of mode
      const categoriesData = await fetchCategories();
      if (categoriesData) {
        setCategories(categoriesData);
      }

      // If edit mode, load product data
      if (isEditMode) {
        const productData = await fetchProductById(id);
        if (productData) {
          // Format form data from product data
          setFormData({
            name: productData.name || '',
            description: productData.description || '',
            richDescription: productData.richDescription || '',
            brand: productData.brand || '',
            price: productData.price || '',
            originalPrice: productData.originalPrice || '',
            category: productData.category?._id || '',
            stockQuantity: productData.stockQuantity || '',
            colors: productData.colors?.join(', ') || '',
            sizes: productData.sizes?.join(', ') || '',
            tags: productData.tags?.join(', ') || '',
            status: productData.status || 'draft',
            isFeatured: productData.isFeatured || false,
            isOnSale: productData.isOnSale || false,
            discountPercentage: productData.discountPercentage || '',
            sku: productData.sku || '',
            weight: productData.weight || '',
            dimensions: {
              length: productData.dimensions?.length || '',
              width: productData.dimensions?.width || '',
              height: productData.dimensions?.height || ''
            },
            shippingClass: productData.shippingClass || 'standard',
            taxClass: productData.taxClass || 'standard'
          });

          // Set existing images
          if (productData.images && productData.images.length > 0) {
            setImages(productData.images);
          }
        }
      }
    };

    loadData();
  }, [isEditMode, id, fetchProductById, fetchCategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear validation error when field is changed
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    if (name.includes('.')) {
      // Handle nested fields like dimensions.length
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Filter for only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;
    
    // Update file list for form submission
    setImageFiles(prev => [...prev, ...imageFiles]);
    
    // Create preview URLs
    const newImagePreviewUrls = imageFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newImagePreviewUrls]);
  };

  const removeImage = (index, type) => {
    if (type === 'new') {
      // Remove from new images
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setImagePreviewUrls(prev => {
        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
    } else {
      // Remove from existing images
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.price) errors.price = 'Price is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.stockQuantity && formData.stockQuantity !== 0) errors.stockQuantity = 'Stock quantity is required';
    
    // Numeric validations
    if (formData.price && isNaN(Number(formData.price))) errors.price = 'Price must be a number';
    if (formData.originalPrice && isNaN(Number(formData.originalPrice))) errors.originalPrice = 'Original price must be a number';
    if (formData.stockQuantity && isNaN(Number(formData.stockQuantity))) errors.stockQuantity = 'Stock quantity must be a number';
    if (formData.discountPercentage && isNaN(Number(formData.discountPercentage))) errors.discountPercentage = 'Discount must be a number';
    
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

  // Prepare form data for submission
  const productFormData = {
    ...formData,
    // Convert string numbers to actual numbers
    price: Number(formData.price),
    stockQuantity: Number(formData.stockQuantity),
    images: imageFiles,
  };

  if (productFormData.status === 'published') {
      productFormData.status = 'active'; // Map 'published' to 'active'
  } else if (!['active', 'inactive', 'draft'].includes(productFormData.status)) {
      // If formData.status is not one of the valid enums (or undefined/null),
      // set a sensible default for creation/update, e.g., 'draft' or 'active'.
      productFormData.status = 'draft';
  }

  // Handle optional number fields and nested objects
  if (formData.originalPrice !== undefined) productFormData.originalPrice = Number(formData.originalPrice);
  if (formData.discountPercentage !== undefined) productFormData.discountPercentage = Number(formData.discountPercentage);
  if (formData.weight !== undefined) productFormData.weight = Number(formData.weight);

  if (formData.dimensions) {
      if (formData.dimensions.length !== undefined) productFormData.dimensions.length = Number(formData.dimensions.length);
      if (formData.dimensions.width !== undefined) productFormData.dimensions.width = Number(formData.dimensions.width);
      if (formData.dimensions.height !== undefined) productFormData.dimensions.height = Number(formData.dimensions.height);
  } else {
      // If formData.dimensions is not provided, ensure it's not sent as undefined/null
      // or set an empty object if your schema requires it, or remove it from payload.
      // For now, if not provided, just let the backend handle its default.
      delete productFormData.dimensions;
  }
  let result;
  try {
    if (isEditMode) {
      result = await updateProduct(id, productFormData);
    } else {
      result = await createProduct(productFormData);
    }

    if (result) {
      // Navigate to product list on success after a short delay
      setTimeout(() => {
        navigate('/app/products');
      }, 1500);
    }
  } catch (error) {
    console.error("Error submitting product form:", error);
  }
};

  const editorRef = useRef(null);
  const handleEditorChange = (content) => {
    setFormData({ ...formData, description: content });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-25">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/app/products')}
          className="text-purple-500 hover:text-purple-600 mr-4 cursor-pointer"
        >
          <FaArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
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
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-800">Basic Information</h3>
          <p className='italic mb-4'>Please note that all fields marked with asterisk (<span className='text-red-700 text-[20px]'>*</span>) are required.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name<span className='text-red-700'>*</span>
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
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className='text-purple-500'>(Optional)</span>
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category<span className='text-red-700'>*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full border ${validationErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {validationErrors.category && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                SKU<span className='text-red-700'>* <span className='text-purple-500'>(This will be generated automatically)</span></span>
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                readOnly
                value={formData.sku}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Product Description<span className='text-red-700'>*</span>
            </label>
            <Editor
              apiKey={RICHT_TEXT_API}
              onInit={(evt, editor) => (editorRef.current = editor)}
              value={formData.richDescription || formData.description}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks |' + 'bold italic forecolor | alignleft aligncenter alignright alignjustify |' + '| bullist numlist outdent indent | ' + 'removeformat | help',
              }}
              onEditorChange={handleEditorChange}
            />
            {validationErrors.description && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
            )}
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Pricing & Inventory</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price<span className='text-red-700'>*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₦</span>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`w-full pl-8 border ${validationErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>
              {validationErrors.price && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Discounted Price <span className='text-[12px] text-purple-600 font-semibold'>(Optional - Must be less than original price)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₦</span>
                <input
                  type="text"
                  id="originalPrice"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className={`w-full pl-8 border ${validationErrors.originalPrice ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>
              {validationErrors.originalPrice && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.originalPrice}</p>
              )}
            </div>

            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity<span className='text-red-700'>*</span>
              </label>
              <input
                type="text"
                id="stockQuantity"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                className={`w-full border ${validationErrors.stockQuantity ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              {validationErrors.stockQuantity && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.stockQuantity}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOnSale"
                name="isOnSale"
                checked={formData.isOnSale}
                onChange={handleChange}
                className="h-4 w-4 text-purple-500 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="isOnSale" className="ml-2 block text-sm text-gray-700">
                On Sale
              </label>
            </div>

            {formData.isOnSale && (
              <div>
                <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="discountPercentage"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    className={`w-full pr-8 border ${validationErrors.discountPercentage ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-600">%</span>
                </div>
                {validationErrors.discountPercentage && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.discountPercentage}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Attributes */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Attributes</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-1">
                Colors <span className='text-[12px] text-purple-500 font-normal'>(Optional - Must be separated with comma)</span>
              </label>
              <input
                type="text"
                id="colors"
                name="colors"
                value={formData.colors}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Red, Blue, Green"
              />
            </div>

            <div>
              <label htmlFor="sizes" className="block text-sm font-medium text-gray-700 mb-1">
                Sizes <span className='text-[12px] text-purple-500 font-normal'>(Optional - Must be separated with comma)</span>
              </label>
              <input
                type="text"
                id="sizes"
                name="sizes"
                value={formData.sizes}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="S, M, L, XL"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags <span className='text-[12px] text-purple-500 font-normal'>(Optional - Must be separated with comma)</span>
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="new, summer, sale"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg) <span className='text-[12px] text-purple-500 font-normal'>(Optional)</span>
              </label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="dimensions.length" className="block text-sm font-medium text-gray-700 mb-1">
                Length (cm) <span className='text-[12px] text-purple-500 font-normal'>(Optional)</span>
              </label>
              <input
                type="text"
                id="dimensions.length"
                name="dimensions.length"
                value={formData.dimensions.length}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="dimensions.width" className="block text-sm font-medium text-gray-700 mb-1">
                Width (cm) <span className='text-[12px] text-purple-500 font-normal'>(Optional)</span>
              </label>
              <input
                type="text"
                id="dimensions.width"
                name="dimensions.width"
                value={formData.dimensions.width}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="dimensions.height" className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm) <span className='text-[12px] text-purple-500 font-normal'>(Optional)</span>
              </label>
              <input
                type="text"
                id="dimensions.height"
                name="dimensions.height"
                value={formData.dimensions.height}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Product Images</h3>

          {/* Image Upload */}
          <div className="mb-6">
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images <span className='text-[12px} text-purple-500 font-semibold'>You can add up to 10 images</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <div className="flex justify-center">
                <FaImage className="text-gray-400 text-4xl mb-3" />
              </div>
              <p className="text-gray-500 mb-2">Drag and drop images here, or click to select files</p>
              <p className="text-xs text-gray-400 mb-4">PNG, JPG, GIF up to 5MB</p>
              <p className="text-xs text-purple-500 mb-4">You can add up to 10 images</p>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="hidden"
              />
              <label
                htmlFor="images"
                className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 cursor-pointer"
              >
                <FaUpload className="mr-2" />
                Select Files
              </label>
            </div>
          </div>

          {/* Image Previews */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images</h4>

            {images.length === 0 && imagePreviewUrls.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No images yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Existing images from server */}
                {images.map((image, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={image.startsWith('http') ? image : `${import.meta.env.VITE_API_URL || ''}${image}`}
                      alt={`Product ${index}`}
                      className="h-32 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, 'existing')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}

                {/* New image previews */}
                {imagePreviewUrls.map((url, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={url}
                      alt={`New upload ${index}`}
                      className="h-32 w-full object-cover rounded-md"
                    />
                    <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-md">New</div>
                    <button
                      type="button"
                      onClick={() => removeImage(index, 'new')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Publication Settings */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Publication Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 text-purple-500 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                Featured Product <span className='text-[12px] font-normal text-purple-500'>(If checked, this will make this product to show on homepage under Featured Products)</span>
              </label>
            </div>
          </div>
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

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/app/products')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            // disabled={loading}
            className="px-4 py-2 bg-purple-500 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
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
                {isEditMode ? 'Update Product' : 'Create Product'}
              </>
            )}
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

