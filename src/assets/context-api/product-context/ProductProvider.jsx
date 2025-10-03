import { useState, useEffect, useContext, useCallback, useMemo } from 'react'; // Added useCallback, useMemo
import axios from 'axios';
import { ProductContext } from './ProductContext'; // Correct self-reference
import { API_BASE_URL } from '../../../config/api'; // Assuming this path is correct
import { UserContext } from '../user-context/UserContext';

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { token } = useContext(UserContext);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Fetch all products with optional filtering, sorting, and pagination
  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    console.log('[ProductProvider] fetchProducts: Initiating fetch for all products with params:', params);
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, { params });
      setProducts(response.data.data);
      setTotalProducts(response.data.totalProducts);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      console.log('[ProductProvider] fetchProducts: Products fetched successfully. Total:', response.data.totalProducts);
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] fetchProducts: Error fetching products:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch products');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] fetchProducts: Loading set to false.');
    }
  }, []); // Dependencies are stable (setters, API_BASE_URL which is a constant)

  // Fetch a single product by ID
  const fetchProductById = useCallback(async (id) => {
    setLoading(true);
    setError('');
    setProduct(null); // Reset product to null before new fetch
    console.log(`[ProductProvider] fetchProductById: Initiating fetch for ID: ${id}`);
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      setProduct(response.data);
      console.log(`[ProductProvider] fetchProductById: Product fetched successfully:`, response.data.name);
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] fetchProductById: Error fetching product by ID:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch product');
      return null;
    } finally {
      setLoading(false);
      console.log(`[ProductProvider] fetchProductById: Loading set to false.`);
    }
  }, []);

  // Fetch a single product by slug (Crucial one for ProductDetailsMain)
  const fetchProductBySlug = useCallback(async (slug) => {
    setLoading(true);
    setError('');
    setProduct(null); // IMPORTANT: Reset product to null before new fetch
    console.log(`[ProductProvider] fetchProductBySlug: Initiating fetch for slug: ${slug}`);
    try {
      const response = await axios.get(`${API_BASE_URL}/products/slug/${slug}`);
      setProduct(response.data);
      console.log(`[ProductProvider] fetchProductBySlug: Product fetched successfully:`, response.data); // Log full data
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] fetchProductBySlug: Error fetching product by slug:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch product');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] fetchProductBySlug: Loading set to false.');
    }
  }, []); // Dependencies are stable (setters, API_BASE_URL)

  // Fetch featured products
  const fetchFeaturedProducts = useCallback(async (limit = 8) => {
    setLoading(true);
    setError('');
    console.log(`[ProductProvider] fetchFeaturedProducts: Initiating fetch for ${limit} featured products.`);
    try {
      const response = await axios.get(`${API_BASE_URL}/products/featured`, { params: { limit } });
      setFeaturedProducts(response.data);
      console.log('[ProductProvider] fetchFeaturedProducts: Featured products fetched successfully.');
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] fetchFeaturedProducts: Error fetching featured products:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch featured products');
      return [];
    } finally {
      setLoading(false);
      console.log('[ProductProvider] fetchFeaturedProducts: Loading set to false.');
    }
  }, []);

  // Fetch sale products
  const fetchSaleProducts = useCallback(async (limit = 8) => {
    setLoading(true);
    setError('');
    console.log(`[ProductProvider] fetchSaleProducts: Initiating fetch for ${limit} sale products.`);
    try {
      const response = await axios.get(`${API_BASE_URL}/products/sale`, { params: { limit } });
      setSaleProducts(response.data);
      console.log('[ProductProvider] fetchSaleProducts: Sale products fetched successfully.');
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] fetchSaleProducts: Error fetching sale products:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch sale products');
      return [];
    } finally {
      setLoading(false);
      console.log('[ProductProvider] fetchSaleProducts: Loading set to false.');
    }
  }, []);

  // Create a new product (admin only)
  const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    console.log('[ProductProvider] createProduct: Initiating product creation.');
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key !== 'images' && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });
      if (productData.images) {
        for (let i = 0; i < productData.images.length; i++) {
          formData.append('images', productData.images[i]);
        }
      }

      const response = await axios.post(`${API_BASE_URL}/products`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Product created successfully!');
      console.log('[ProductProvider] createProduct: Product created successfully!');
      // Consider refreshing relevant lists if needed, e.g., fetchProducts();
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] createProduct: Error creating product:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to create product');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] createProduct: Loading set to false.');
    }
  }, [token]); // token is a dependency

  // Update an existing product (admin only)
  const updateProduct = useCallback(async (id, productData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    console.log(`[ProductProvider] updateProduct: Initiating update for product ID: ${id}`);
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key !== 'images' && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });
      if (productData.images) {
        for (let i = 0; i < productData.images.length; i++) {
          formData.append('images', productData.images[i]);
        }
      }

      const response = await axios.put(`${API_BASE_URL}/products/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Product updated successfully!');
      console.log(`[ProductProvider] updateProduct: Product ID ${id} updated successfully.`);
      if (product && product._id === id) {
        setProduct(response.data);
      }
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] updateProduct: Error updating product:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to update product');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] updateProduct: Loading set to false.');
    }
  }, [token, product]); // token and product are dependencies

  // Delete a product (admin only)
  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');
    console.log(`[ProductProvider] deleteProduct: Initiating delete for product ID: ${id}`);
    try {
      await axios.delete(`${API_BASE_URL}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess('Product deleted successfully!');
      console.log(`[ProductProvider] deleteProduct: Product ID ${id} deleted successfully.`);
      setProducts(prevProducts => prevProducts.filter(p => p._id !== id));
      return true;
    } catch (err) {
      console.error('[ProductProvider] deleteProduct: Error deleting product:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete product');
      return false;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] deleteProduct: Loading set to false.');
    }
  }, [token, products]); // token and products are dependencies

  // Delete a product image (admin only)
  const deleteProductImage = useCallback(async (productId, imageIndex) => {
    setLoading(true);
    setError('');
    setSuccess('');
    console.log(`[ProductProvider] deleteProductImage: Deleting image ${imageIndex} for product ${productId}.`);
    try {
      const response = await axios.delete(`${API_BASE_URL}/products/${productId}/images/${imageIndex}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess('Image deleted successfully!');
      console.log('[ProductProvider] deleteProductImage: Image deleted successfully.');
      if (product && product._id === productId) {
        setProduct(response.data.product);
      }
      return response.data.product;
    } catch (err) {
      console.error('[ProductProvider] deleteProductImage: Error deleting product image:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete product image');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] deleteProductImage: Loading set to false.');
    }
  }, [token, product]);

  // Set featured image (admin only)
  const setFeaturedImage = useCallback(async (productId, imageIndex) => {
    setLoading(true);
    setError('');
    setSuccess('');
    console.log(`[ProductProvider] setFeaturedImage: Setting featured image ${imageIndex} for product ${productId}.`);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/products/${productId}/featured-image`,
        { imageIndex },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setSuccess('Featured image updated successfully!');
      console.log('[ProductProvider] setFeaturedImage: Featured image updated.');
      if (product && product._id === productId) {
        setProduct(response.data.product);
      }
      return response.data.product;
    } catch (err) {
      console.error('[ProductProvider] setFeaturedImage: Error setting featured image:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to set featured image');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] setFeaturedImage: Loading set to false.');
    }
  }, [token, product]);

  // Update product inventory (admin only)
  const updateInventory = useCallback(async (productId, quantity) => {
    setLoading(true);
    setError('');
    setSuccess('');
    console.log(`[ProductProvider] updateInventory: Updating inventory for product ${productId} to ${quantity}.`);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/products/${productId}/inventory`,
        { quantity },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setSuccess('Inventory updated successfully!');
      console.log('[ProductProvider] updateInventory: Inventory updated.');
      if (product && product._id === productId) {
        setProduct(response.data.product);
      }
      return response.data.product;
    } catch (err) {
      console.error('[ProductProvider] updateInventory: Error updating inventory:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to update inventory');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] updateInventory: Loading set to false.');
    }
  }, [token, product]);

  // Bulk update product statuses (admin only)
  const bulkUpdateStatus = useCallback(async (productIds, status) => {
    setLoading(true);
    setError('');
    setSuccess('');
    console.log(`[ProductProvider] bulkUpdateStatus: Bulk updating status for ${productIds.length} products to ${status}.`);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/products/bulk/status`,
        { productIds, status },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setSuccess(`${productIds.length} products updated to ${status}!`);
      console.log('[ProductProvider] bulkUpdateStatus: Products status bulk updated.');
      if (products.length > 0) { // Only refresh if products are already loaded
        await fetchProducts(); // Call the memoized fetchProducts
      }
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] bulkUpdateStatus: Error bulk updating products:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to update products');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] bulkUpdateStatus: Loading set to false.');
    }
  }, [token, products, fetchProducts]); // fetchProducts is a dependency

  // Add a product review
  const addProductReview = useCallback(async (productId, reviewData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    console.log(`[ProductProvider] addProductReview: Adding review for product ${productId}.`);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/products/${productId}/reviews`,
        reviewData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setSuccess('Review added successfully!');
      console.log('[ProductProvider] addProductReview: Review added.');
      if (product && product._id === productId) {
        setProduct(response.data.product); // Assuming backend returns updated product
      }
      return response.data.product;
    } catch (err) {
      console.error('[ProductProvider] addProductReview: Error adding review:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to add review');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] addProductReview: Loading set to false.');
    }
  }, [token, product]);

  // Category Functions ===================================

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    console.log('[ProductProvider] fetchCategories: Initiating fetch for categories.');
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
      console.log('[ProductProvider] fetchCategories: Categories fetched successfully.');
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] fetchCategories: Error fetching categories:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch categories');
      return [];
    } finally {
      setLoading(false);
      console.log('[ProductProvider] fetchCategories: Loading set to false.');
    }
  }, []);

  const fetchCategoryById = useCallback(async (id) => {
    setLoading(true);
    setError('');
    setCategory(null);
    console.log(`[ProductProvider] fetchCategoryById: Initiating fetch for category ID: ${id}`);
    try {
      const response = await axios.get(`${API_BASE_URL}/categories/${id}`);
      setCategory(response.data);
      console.log('[ProductProvider] fetchCategoryById: Category fetched successfully.');
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] fetchCategoryById: Error fetching category by ID:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch category');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] fetchCategoryById: Loading set to false.');
    }
  }, []);

  const fetchCategoryBySlug = useCallback(async (slug) => {
    setLoading(true);
    setError('');
    setCategory(null);
    console.log(`[ProductProvider] fetchCategoryBySlug: Initiating fetch for category slug: ${slug}`);
    try {
      const response = await axios.get(`${API_BASE_URL}/categories/slug/${slug}`);
      setCategory(response.data);
      console.log('[ProductProvider] fetchCategoryBySlug: Category fetched successfully.');
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] fetchCategoryBySlug: Error fetching category by slug:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch category');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] fetchCategoryBySlug: Loading set to false.');
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    console.log('[ProductProvider] createCategory: Initiating category creation.');
    try {
      if (!categoryData.name || categoryData.name.trim() === '') {
        setError('Category name is required');
        setLoading(false);
        return null;
      }

      const formData = new FormData();
      formData.append('name', categoryData.name.trim());
      if (categoryData.description) formData.append('description', categoryData.description);
      if (categoryData.parent) formData.append('parent', categoryData.parent);
      if (categoryData.sortOrder !== undefined) formData.append('sortOrder', categoryData.sortOrder.toString());
      if (categoryData.isActive !== undefined) formData.append('isActive', categoryData.isActive.toString());
      if (categoryData.image) formData.append('image', categoryData.image);

      const response = await axios.post(`${API_BASE_URL}/categories`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Category created successfully!');
      console.log('[ProductProvider] createCategory: Category created successfully.');
      await fetchCategories(); // Refresh categories list
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] createCategory: Error creating category:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to create category');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] createCategory: Loading set to false.');
    }
  }, [token, fetchCategories]); // token and fetchCategories are dependencies

  const updateCategory = useCallback(async (id, categoryData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    console.log(`[ProductProvider] updateCategory: Initiating update for category ID: ${id}`);
    try {
      const formData = new FormData();
      Object.keys(categoryData).forEach(key => {
        if (key !== 'image' && categoryData[key] !== undefined) {
          formData.append(key, categoryData[key]);
        }
      });
      if (categoryData.image) {
        formData.append('image', categoryData.image);
      } else if (categoryData.image === '') { // Explicitly handle image removal
        formData.append('image', '');
      }

      const response = await axios.put(`${API_BASE_URL}/categories/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Category updated successfully!');
      console.log('[ProductProvider] updateCategory: Category updated successfully.');
      await fetchCategories(); // Refresh categories list
      if (category && category._id === id) {
        setCategory(response.data);
      }
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] updateCategory: Error updating category:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to update category');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] updateCategory: Loading set to false.');
    }
  }, [token, fetchCategories, category]); // token, fetchCategories, category are dependencies

  const deleteCategory = useCallback(async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');
    console.log(`[ProductProvider] deleteCategory: Initiating delete for category ID: ${id}`);
    try {
      await axios.delete(`${API_BASE_URL}/categories/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess('Category deleted successfully!');
      console.log('[ProductProvider] deleteCategory: Category deleted successfully.');
      setCategories(prevCategories => prevCategories.filter(c => c._id !== id));
      return true;
    } catch (err) {
      console.error('[ProductProvider] deleteCategory: Error deleting category:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete category');
      return false;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] deleteCategory: Loading set to false.');
    }
  }, [token, categories]); // token and categories are dependencies

  const getProductsByCategory = useCallback(async (categoryId, params = {}) => {
    setLoading(true);
    setError('');
    console.log(`[ProductProvider] getProductsByCategory: Fetching products for category ${categoryId}.`);
    try {
      const queryParams = { ...params, category: categoryId };
      const response = await axios.get(`${API_BASE_URL}/products`, { params: queryParams });
      console.log('[ProductProvider] getProductsByCategory: Products by category fetched successfully.');
      return response.data;
    } catch (err) {
      console.error('[ProductProvider] getProductsByCategory: Error fetching products by category:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch products');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] getProductsByCategory: Loading set to false.');
    }
  }, []);

  const getProductsByCategorySlug = useCallback(async (slug, params = {}) => {
    setLoading(true);
    setError('');
    console.log(`[ProductProvider] getProductsByCategorySlug: Fetching products for category slug: ${slug}.`);
    try {
      const categoryResponse = await axios.get(`${API_BASE_URL}/categories/slug/${slug}`);
      const categoryId = categoryResponse.data._id;
      return await getProductsByCategory(categoryId, params); // Calls memoized function
    } catch (err) {
      console.error('[ProductProvider] getProductsByCategorySlug: Error fetching products by category slug:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch products');
      return null;
    } finally {
      setLoading(false);
      console.log('[ProductProvider] getProductsByCategorySlug: Loading set to false.');
    }
  }, [getProductsByCategory]); // getProductsByCategory is a dependency

  // Helper Functions (these are already stable by nature or don't use state)
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  }, []);

  const calculateSalePrice = useCallback((price, discountPercentage) => {
    if (!discountPercentage) return price;
    return price * (1 - discountPercentage / 100);
  }, []);

  const getCategoryTree = useCallback(() => {
    const rootCategories = categories.filter(cat => !cat.parent);
    const buildTree = (parentId) => {
      return categories
        .filter(cat => cat.parent && cat.parent.toString() === parentId.toString())
        .map(cat => ({
          ...cat,
          children: buildTree(cat._id)
        }));
    };
    return rootCategories.map(cat => ({
      ...cat,
      children: buildTree(cat._id)
    }));
  }, [categories]); // categories is a dependency

  // Memoize the entire context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    products, featuredProducts, saleProducts, product, categories, category,
    loading, error, success, totalProducts, totalPages, currentPage,
    fetchProducts, fetchProductById, fetchProductBySlug, fetchFeaturedProducts,
    fetchSaleProducts, createProduct, updateProduct, deleteProduct,
    deleteProductImage, setFeaturedImage, updateInventory, bulkUpdateStatus,
    addProductReview, fetchCategories, fetchCategoryById, fetchCategoryBySlug,
    createCategory, updateCategory, deleteCategory, getProductsByCategory,
    getProductsByCategorySlug, getCategoryTree, formatPrice, calculateSalePrice
  }), [
    products, featuredProducts, saleProducts, product, categories, category,
    loading, error, success, totalProducts, totalPages, currentPage,
    fetchProducts, fetchProductById, fetchProductBySlug, fetchFeaturedProducts,
    fetchSaleProducts, createProduct, updateProduct, deleteProduct,
    deleteProductImage, setFeaturedImage, updateInventory, bulkUpdateStatus,
    addProductReview, fetchCategories, fetchCategoryById, fetchCategoryBySlug,
    createCategory, updateCategory, deleteCategory, getProductsByCategory,
    getProductsByCategorySlug, getCategoryTree, formatPrice, calculateSalePrice
  ]);


  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};