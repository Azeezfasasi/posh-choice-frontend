import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { compressImage } from '../../../utils/compressImage';
import { useBlog } from '../../context-api/blog-context/UseBlog';
import BlogPostForm from './BlogPostForm';

function EditBlogPostMain() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBlog, editBlog } = useBlog();
  const [initial, setInitial] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      const blog = await getBlog(id);
      if (blog) {
        setInitial({
          title: blog.title || '',
          content: blog.content || '',
          categories: blog.categories || [],
          status: blog.status || 'draft',
          image: null,
        });
        setExistingImage(blog.image || null);
      }
    };
    fetchBlog();
    // eslint-disable-next-line
  }, [id]);

  const handleSubmit = async (form) => {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    form.categories.forEach(cat => formData.append('categories', cat));
    formData.append('status', form.status);
    if (form.image) formData.append('image', await compressImage(form.image));
    const updated = await editBlog(id, formData);
    if (updated) navigate('/app/blogposts');
  };

  return (
    <div>
      <Link to="/app/blogposts" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Back to blog posts
      </Link>
      {initial ? (
        <BlogPostForm initial={initial} existingImage={existingImage} submitLabel="Save changes" busyLabel="Saving…" onSubmit={handleSubmit} />
      ) : (
        <div className="h-96 rounded-2xl bg-white border border-line animate-pulse" aria-busy="true" />
      )}
    </div>
  );
}

export default EditBlogPostMain;
