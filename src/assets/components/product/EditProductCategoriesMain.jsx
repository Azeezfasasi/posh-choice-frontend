import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

const fetchCategory = async (id) => {
  const { data } = await axios.get(`${API_BASE_URL}/categories/${id}`);
  return data;
};

const fetchCategories = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/categories`);
  return data;
};

const updateCategory = async ({ id, formData }) => {
  const token = localStorage.getItem('token');
  const res = await axios.put(`${API_BASE_URL}/categories/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

function EditProductCategoriesMain() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    description: '',
    parent: '',
    sortOrder: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [clearImage, setClearImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Fetch category data
  const { data: category, isLoading, error } = useQuery({
    queryKey: ['category', id],
    queryFn: () => fetchCategory(id),
    enabled: !!id,
  });
  // Fetch all categories for parent dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        description: category.description || '',
        parent: category.parent?._id || '',
        sortOrder: category.sortOrder || 0,
        isActive: category.isActive !== undefined ? category.isActive : true,
      });
      setClearImage(false);
      setImageFile(null);
    }
  }, [category]);

  const mutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      queryClient.invalidateQueries(['category', id]);
      navigate('/app/productcategories');
    },
    onError: (err) => {
      setServerError(err?.response?.data?.error || 'Failed to update category.');
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
    setClearImage(false);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setClearImage(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('parent', form.parent);
    formData.append('sortOrder', form.sortOrder);
    formData.append('isActive', form.isActive);
    if (imageFile) formData.append('image', imageFile);
    if (clearImage) formData.append('clearImage', 'true');
    mutation.mutate({ id, formData });
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error.message}</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Category</h2>
      {serverError && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{serverError}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {validationErrors.name && <div className="text-red-500 text-sm">{validationErrors.name}</div>}
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Parent Category</label>
          <select
            name="parent"
            value={form.parent}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">None (Top-level)</option>
            {categories
              .filter((cat) => cat._id !== id)
              .map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Sort Order</label>
          <input
            type="number"
            name="sortOrder"
            value={form.sortOrder}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            id="isActive"
          />
          <label htmlFor="isActive" className="font-medium">Active</label>
        </div>
        <div>
          <label className="block font-medium mb-1">Category Image</label>
          {/* Show preview of newly selected image */}
          {imageFile && (
            <div className="mb-2 flex items-center gap-3">
              <img src={URL.createObjectURL(imageFile)} alt="New Preview" className="w-20 h-20 object-cover rounded border" />
              <span className="text-sm text-gray-500">(New image preview)</span>
              <button type="button" onClick={handleClearImage} className="text-red-600 underline text-sm">Remove</button>
            </div>
          )}
          {/* Show current image if no new image is selected and not cleared */}
          {!imageFile && category?.image && !clearImage && (
            <div className="mb-2 flex items-center gap-3">
              <img src={category.image} alt="Category" className="w-20 h-20 object-cover rounded border" />
              <button type="button" onClick={handleClearImage} className="text-red-600 underline text-sm">Remove</button>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 cursor-pointer"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
            onClick={() => navigate('/app/productcategories')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProductCategoriesMain;