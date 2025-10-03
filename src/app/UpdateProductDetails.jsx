import React, { useState, useContext, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductContext } from '../assets/context-api/product-context/ProductContext';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

const fetchProductById = async (id, token) => {
  console.log('[UpdateProductDetails] fetchProductById called with id:', id, 'token:', !!token);
  const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  console.log('[UpdateProductDetails] fetchProductById response:', response.data);
  return response.data;
};

const updateProductRequest = async ({ id, formData, token }) => {
  const response = await axios.put(`${API_BASE_URL}/products/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export default function UpdateProductDetails({ productId, onSuccess }) {
  console.log('[UpdateProductDetails] Rendered with productId:', productId);
  const { token } = useContext(ProductContext);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});
  const [existingImages, setExistingImages] = useState([]); // URLs
  const [newImages, setNewImages] = useState([]); // File objects
  const fileInputRef = useRef();

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId, token),
    enabled: !!productId,
    onSuccess: (data) => {
      console.log('[UpdateProductDetails] onSuccess data:', data);
      setForm({
        name: data.name || '',
        description: data.description || '',
        richDescription: data.richDescription || '',
        price: data.price || '',
        originalPrice: data.originalPrice || '',
        category: data.category?._id || data.category || '',
        brand: data.brand || '',
        sku: data.sku || '',
        stockQuantity: data.stockQuantity || '',
        isFeatured: data.isFeatured || false,
        discountPercentage: data.discountPercentage || 0,
        status: data.status || 'draft',
        weight: data.weight || '',
        dimensions: data.dimensions || {},
        colors: data.colors || [],
        sizes: data.sizes || [],
        tags: data.tags || [],
      });
      setExistingImages(data.images || []);
    },
    onError: (err) => {
      console.error('[UpdateProductDetails] fetchProductById error:', err);
    },
  });

  // Mutation for updating product
  const mutation = useMutation({
    mutationFn: ({ id, formData, token }) => updateProductRequest({ id, formData, token }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['product', productId]);
      if (onSuccess) onSuccess(data);
    },
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle array fields (colors, sizes, tags)
  const handleArrayChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value.split(',').map((v) => v.trim()).filter(Boolean) }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  // Remove an existing image (by index)
  const handleRemoveExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Remove a new image (by index)
  const handleRemoveNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    // Append all fields
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'discountPercentage') {
        const val = Number(value);
        if (!isNaN(val)) formData.append('discountPercentage', String(val));
      } else if (['colors', 'sizes', 'tags'].includes(key)) {
        if (Array.isArray(value)) {
          formData.append(key, value.join(','));
        } else if (typeof value === 'string') {
          formData.append(key, value);
        }
      } else if (key === 'dimensions' && value) {
        // Flatten dimensions
        if (typeof value === 'object') {
          Object.entries(value).forEach(([dimKey, dimVal]) => {
            if (dimVal !== undefined && dimVal !== '') {
              formData.append(`dimensions[${dimKey}]`, dimVal);
            }
          });
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    // Existing images (send as JSON string of array of objects)
    if (existingImages.length > 0) {
      formData.append('existingImageUrls', JSON.stringify(existingImages));
    }
    // New images
    newImages.forEach((file) => {
      formData.append('images', file);
    });
    mutation.mutate({ id: productId, formData, token });
  };

  if (isLoading) return <div>Loading product...</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Update Product Details</h2>
      <div>
        <label>Name:</label>
        <input name="name" value={form.name || ''} onChange={handleChange} required />
      </div>
      <div>
        <label>Description:</label>
        <textarea name="description" value={form.description || ''} onChange={handleChange} required />
      </div>
      <div>
        <label>Rich Description:</label>
        <textarea name="richDescription" value={form.richDescription || ''} onChange={handleChange} />
      </div>
      <div>
        <label>Price:</label>
        <input name="price" type="number" value={form.price || ''} onChange={handleChange} required />
      </div>
      <div>
        <label>Original Price:</label>
        <input name="originalPrice" type="number" value={form.originalPrice || ''} onChange={handleChange} />
      </div>
      <div>
        <label>Category:</label>
        <input name="category" value={form.category || ''} onChange={handleChange} required />
      </div>
      <div>
        <label>Brand:</label>
        <input name="brand" value={form.brand || ''} onChange={handleChange} />
      </div>
      <div>
        <label>SKU:</label>
        <input name="sku" value={form.sku || ''} onChange={handleChange} />
      </div>
      <div>
        <label>Stock Quantity:</label>
        <input name="stockQuantity" type="number" value={form.stockQuantity || ''} onChange={handleChange} required />
      </div>
      <div>
        <label>Is Featured:</label>
        <input name="isFeatured" type="checkbox" checked={!!form.isFeatured} onChange={handleChange} />
      </div>
      <div>
        <label>Discount Percentage:</label>
        <input name="discountPercentage" type="number" value={form.discountPercentage || 0} onChange={handleChange} min="0" max="100" />
      </div>
      <div>
        <label>Status:</label>
        <select name="status" value={form.status || 'draft'} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <div>
        <label>Weight:</label>
        <input name="weight" type="number" value={form.weight || ''} onChange={handleChange} />
      </div>
      <div>
        <label>Dimensions (L x W x H):</label>
        <input
          name="dimensions.length"
          type="number"
          placeholder="Length"
          value={form.dimensions?.length || ''}
          onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions, length: e.target.value } }))}
        />
        <input
          name="dimensions.width"
          type="number"
          placeholder="Width"
          value={form.dimensions?.width || ''}
          onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions, width: e.target.value } }))}
        />
        <input
          name="dimensions.height"
          type="number"
          placeholder="Height"
          value={form.dimensions?.height || ''}
          onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions, height: e.target.value } }))}
        />
      </div>
      <div>
        <label>Colors (comma separated):</label>
        <input
          name="colors"
          value={Array.isArray(form.colors) ? form.colors.join(',') : form.colors || ''}
          onChange={e => handleArrayChange('colors', e.target.value)}
        />
      </div>
      <div>
        <label>Sizes (comma separated):</label>
        <input
          name="sizes"
          value={Array.isArray(form.sizes) ? form.sizes.join(',') : form.sizes || ''}
          onChange={e => handleArrayChange('sizes', e.target.value)}
        />
      </div>
      <div>
        <label>Tags (comma separated):</label>
        <input
          name="tags"
          value={Array.isArray(form.tags) ? form.tags.join(',') : form.tags || ''}
          onChange={e => handleArrayChange('tags', e.target.value)}
        />
      </div>
      <div>
        <label>Existing Images:</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {existingImages.map((img, idx) => (
            <div key={img.url || idx} style={{ position: 'relative' }}>
              <img src={img.url} alt="Product" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }} />
              <button type="button" onClick={() => handleRemoveExistingImage(idx)} style={{ position: 'absolute', top: 0, right: 0 }}>x</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label>Upload New Images:</label>
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {newImages.map((file, idx) => (
            <div key={file.name + idx} style={{ position: 'relative' }}>
              <img src={URL.createObjectURL(file)} alt="New" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }} />
              <button type="button" onClick={() => handleRemoveNewImage(idx)} style={{ position: 'absolute', top: 0, right: 0 }}>x</button>
            </div>
          ))}
        </div>
      </div>
      <button type="submit" disabled={mutation.isLoading}>
        {mutation.isLoading ? 'Updating...' : 'Update Product'}
      </button>
      {mutation.isError && <div style={{ color: 'red' }}>{mutation.error?.response?.data?.error || 'Update failed'}</div>}
      {mutation.isSuccess && <div style={{ color: 'green' }}>Product updated successfully!</div>}
    </form>
  );
}
