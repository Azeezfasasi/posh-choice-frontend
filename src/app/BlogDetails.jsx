import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import TopHeader from '../assets/components/TopHeader';
import MainHeader from '../assets/components/MainHeader';
import { useBlog } from '../assets/context-api/blog-context/UseBlog';
import Footer from '../assets/components/Footer';
import { Helmet } from 'react-helmet';

function BlogDetail() {
  const { id } = useParams();
  const { getBlog } = useBlog();
  const [blog, setBlog] = useState(null);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');

useEffect(() => {
  const loadBlog = async () => {
    try {
      const blogData = await getBlog(id);
      if (blogData) {
        setBlog(blogData);
      }
    } catch (err) {
      console.error("Failed to fetch blog:", err);
    }
  };
  
  loadBlog();
}, [id, getBlog]);

  const handleLike = () => {
    setLikes(prev => prev + 1);
  };

  const handleAddComment = () => {
    if (!commentInput) return;
    setComments(prev => [...prev, commentInput]);
    setCommentInput('');
  };

  if (!blog) return <div className="text-center py-8">Blog post not found</div>;

  return (
    <>
      <Helmet>
        <title>{blog.title} - Posh Choice Store</title>
      </Helmet>
      <TopHeader />
      <MainHeader />
      <div className="max-w-4xl mx-auto mt-8 px-4 pb-12">
        <div className="mb-6">
          <Link to="/app/blog" className="text-blue-600 hover:underline">
            ← Back to blogs
          </Link>
        </div>
        
        <article className="bg-white rounded-lg shadow-lg p-6">
          {blog.image && (
            <img
              src={blog.image.startsWith('http') ? blog.image : `${import.meta.env.VITE_API_URL || ''}${blog.image}`}
              alt={blog.title}
              className="w-full h-72 object-cover rounded-lg mb-6"
            />
          )}
          
          <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
          
          <div className="flex items-center justify-between mb-6">
            <div className="text-gray-600">
              By {blog.author?.name || 'Unknown'} | {new Date(blog.createdAt).toLocaleDateString()}
            </div>
            <div>
              {blog.categories && blog.categories.map((cat) => (
                <span key={cat} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2">
                  {cat}
                </span>
              ))}
            </div>
          </div>
          
          <div className="prose max-w-none mb-8">
            <p className="text-gray-800 whitespace-pre-line">{blog.content}</p>
          </div>
          
          <div className="border-t pt-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                onClick={handleLike}
              >
                Like ({likes})
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold text-xl mb-4">Comments</h3>
              {comments.length === 0 ? (
                <p className="text-gray-500 mb-4">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {comments.map((comment, idx) => (
                    <div key={idx} className="bg-gray-100 rounded-lg p-4">
                      <p>{comment}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  className="flex-1 border rounded px-4 py-2"
                  placeholder="Add a comment..."
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={handleAddComment}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
}

export default BlogDetail;