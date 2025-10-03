import React, { useEffect } from 'react';
import { useBlog } from '../../context-api/blog-context/UseBlog';
import { useNavigate } from 'react-router-dom';

function BlogPostMain() {
  const {
    blogs,
    fetchBlogs,
    deleteBlog,
    // changeStatus,
    loading,
    error,
    success
  } = useBlog();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      deleteBlog(id);
    }
  };

  // const handleStatus = (id, currentStatus) => {
  //   const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  //   changeStatus(id, newStatus);
  // };

  const handleEdit = (id) => {
    navigate(`/app/editblogpost/${id}`);
  };

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">All Blog Posts</h2>
      {error && <div className="text-red-600 text-center mb-4">{error}</div>}
      {success && <div className="text-green-600 text-center mb-4">{success}</div>}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : blogs.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No blog posts found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-lg shadow p-6 flex flex-col">
              <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
              <div className="text-gray-600 text-sm mb-2">
                By {blog.author?.name || 'Unknown'} | {new Date(blog.createdAt).toLocaleDateString()}
              </div>
              <div className="mb-2">
                <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs mr-2">
                  {blog.status}
                </span>
                {blog.categories && blog.categories.map((cat) => (
                  <span key={cat} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2">
                    {cat}
                  </span>
                ))}
              </div>
              <p className="text-gray-800 mb-4 line-clamp-3">{blog.content}</p>
              <div className="flex gap-2 mt-auto">
                <button
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm cursor-pointer"
                  onClick={() => handleEdit(blog._id)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm cursor-pointer"
                  onClick={() => handleDelete(blog._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogPostMain;