import React, { useEffect, useState } from 'react';
import TopHeader from '../assets/components/TopHeader';
import MainHeader from '../assets/components/MainHeader';
import { useBlog } from '../assets/context-api/blog-context/UseBlog';
import { Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import Footer from '../assets/components/Footer';
import { Helmet } from 'react-helmet';


function Blog() {
  const { blogs, categories, fetchBlogs, loading, error } = useBlog();
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchBlogs(selectedCategory ? { category: selectedCategory } : {});
    // eslint-disable-next-line
  }, [selectedCategory]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] bg-gray-50 p-6 rounded-lg ">
        <FaSpinner className="animate-spin text-purple-500 text-4xl mr-3" />
        <p className="text-xl text-gray-700">Loading blog page...</p>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Blog - Posh Choice Store</title>
      </Helmet>
      <TopHeader />
      <MainHeader />
      <div className="max-w-5xl mx-auto mt-8 px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Blog</h2>
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          <button
            className={`px-4 py-2 rounded ${selectedCategory === '' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setSelectedCategory('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded ${selectedCategory === cat ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No blog posts found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((blog) => (
              <div key={blog._id} className="bg-white rounded-lg shadow p-6 flex flex-col">
                <Link to={`/app/blogdetails/${blog._id}`} className="group">
                {blog.image && (
                  <img
                    src={blog.image.startsWith('http') ? blog.image : `${import.meta.env.VITE_API_URL || ''}${blog.image}`}
                    alt={blog.title}
                    className="h-48 w-full object-cover rounded mb-4"
                  />
                )}
                </Link>
                <Link to={`/app/blogdetails/${blog._id}`} className="group">
                    <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                </Link>
                <div className="text-gray-600 text-sm mb-2">
                  By {blog.author?.name || 'Unknown'} | {new Date(blog.createdAt).toLocaleDateString()}
                </div>
                <div className="mb-2">
                  {blog.categories && blog.categories.map((cat) => (
                    <span key={cat} className="inline-block bg-blue-100 text-purple-500 px-2 py-1 rounded text-xs mr-2">
                      {cat}
                    </span>
                  ))}
                </div>
                <Link to={`/app/blogdetails/${blog._id}`} className="text-purple-500 hover:underline mb-4">
                  Read more →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Blog;