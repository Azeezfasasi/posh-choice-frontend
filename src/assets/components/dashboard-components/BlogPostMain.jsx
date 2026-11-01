import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FilePlus2, ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { useBlog } from '../../context-api/blog-context/UseBlog';
import { blogImageUrl, cleanText, excerpt, formatPostDate } from '../blog/blogUtils';

const STATUS_STYLE = {
  published: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  draft: 'bg-amber-50 text-amber-800 ring-amber-200',
};

function BlogPostMain() {
  const {
    blogs,
    fetchBlogs,
    deleteBlog,
    loading,
    error,
    success
  } = useBlog();

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      deleteBlog(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {blogs.length} post{blogs.length === 1 ? '' : 's'} · {blogs.filter(b => b.status === 'draft').length} draft{blogs.filter(b => b.status === 'draft').length === 1 ? '' : 's'}
        </p>
        <Link to="/app/addnewpost" className="inline-flex items-center gap-2 rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700 transition">
          <FilePlus2 className="w-4 h-4" /> New post
        </Link>
      </div>

      <div aria-live="polite">
        {error && <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}
        {success && <p className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">{success}</p>}
      </div>

      {loading && blogs.length === 0 ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map(i => <div key={i} className="h-28 rounded-2xl bg-white border border-line animate-pulse" />)}
        </div>
      ) : blogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white py-14 text-center">
          <p className="text-ink-soft">No blog posts yet.</p>
          <Link to="/app/addnewpost" className="mt-4 inline-flex rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700">Write your first post</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {blogs.map((blog) => {
            const image = blogImageUrl(blog.image);
            return (
              <li key={blog._id} className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-line bg-white p-4">
                <div className="shrink-0 w-full sm:w-40 aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-br from-plum-700 via-plum-900 to-ink flex items-center justify-center">
                  {image ? <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" /> : <ImageIcon className="w-6 h-6 text-white/50" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${STATUS_STYLE[blog.status] || 'bg-cream text-ink ring-line'}`}>
                      {blog.status}
                    </span>
                    {blog.categories?.map(cat => (
                      <span key={cat} className="rounded-full bg-plum-50 px-2.5 py-0.5 text-xs font-medium text-plum-700">{cat}</span>
                    ))}
                  </div>
                  <h3 className="mt-2 font-sans text-base font-semibold text-ink truncate">{cleanText(blog.title)}</h3>
                  <p className="mt-1 text-sm text-ink-soft line-clamp-2">{excerpt(blog.content, 200)}</p>
                  <p className="mt-2 text-xs text-ink-soft">By {blog.author?.name || 'Unknown'} · {formatPostDate(blog)}</p>
                </div>
                <div className="flex sm:flex-col gap-2 sm:justify-center shrink-0">
                  <Link to={`/app/editblogpost/${blog._id}`} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-cream">
                    <Pencil className="w-4 h-4" /> Edit
                  </Link>
                  {blog.status === 'published' && (
                    <Link to={`/app/blogdetails/${blog._id}`} target="_blank" className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-cream">
                      <ExternalLink className="w-4 h-4" /> View
                    </Link>
                  )}
                  <button type="button" onClick={() => handleDelete(blog._id)} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default BlogPostMain;
