import React, { useState } from 'react';
import { useBlog } from '../../context-api/blog-context/UseBlog';

function AddPost() {
  const { createBlog, loading, error, success } = useBlog();
  const [form, setForm] = useState({
    title: '',
    content: '',
    categories: [],
    status: 'published',
    image: null,
  });
  // const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm({ ...form, image: files[0] });
      // setPreview(URL.createObjectURL(files[0]));
    } else if (name === 'categories') {
      setForm({ ...form, categories: Array.from(e.target.selectedOptions, opt => opt.value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    form.categories.forEach(cat => formData.append('categories', cat));
    formData.append('status', form.status);
    if (form.image) formData.append('image', form.image);
    await createBlog(formData);
    setForm({ title: '', content: '', categories: [], status: 'draft', image: null });
    // setPreview(null);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Blog Post</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Content</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 min-h-[120px]"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Categories</label>
          <select
            name="categories"
            multiple
            value={form.categories}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
              <option value="Business">Business</option>
              <option value="Repair">Repair</option>
              <option value="Web Development">Web Developmemt</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        {/* <div>
          <label className="block font-semibold mb-1">Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
          />
          {preview && (
            <img src={preview} alt="Preview" className="mt-2 h-32 object-cover rounded" />
          )}
        </div> */}
        {error && <div className="text-red-600 text-center">{error}</div>}
        {success && <div className="text-green-600 text-center">{success}</div>}
        <button
          type="submit"
          className="w-full bg-purple-500 text-white py-2 rounded font-semibold hover:bg-purple-600 transition cursor-pointer"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Add Blog Post'}
        </button>
      </form>
    </div>
  );
}

export default AddPost;