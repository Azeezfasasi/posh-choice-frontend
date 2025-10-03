import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlog } from '../../context-api/blog-context/UseBlog';
import back from '../../images/back.svg';
import { Link } from 'react-router-dom';

function EditBlogPostMain() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBlog, editBlog, categories, loading, error, success } = useBlog();
  const [form, setForm] = useState({
    title: '',
    content: '',
    categories: [],
    status: 'draft',
    image: null,
  });

  useEffect(() => {
    const fetchBlog = async () => {
      const blog = await getBlog(id);
      if (blog) {
        setForm({
          title: blog.title || '',
          content: blog.content || '',
          categories: blog.categories || [],
          status: blog.status || 'draft',
          image: null,
        });
      }
    };
    fetchBlog();
    // eslint-disable-next-line
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm({ ...form, image: files[0] });
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
    const updated = await editBlog(id, formData);
    if (updated) {
      navigate('/app/blogposts');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <Link to="/app/blogposts" className='flex flex-row justify-start mb-6'>
          <img src={back} alt="Back" className='w-7 h-7 mr-2' /><p className='font-semibold'>Back to Blog Posts</p>
      </Link>
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Blog Post</h2>
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
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
        </div> */}
        {error && <div className="text-red-600 text-center">{error}</div>}
        {success && <div className="text-green-600 text-center">{success}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition cursor-pointer"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Blog Post'}
        </button>
      </form>
    </div>
  );
}

export default EditBlogPostMain;