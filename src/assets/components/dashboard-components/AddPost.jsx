import React from 'react';
import { useNavigate } from 'react-router-dom';
import { compressImage } from '../../../utils/compressImage';
import { useBlog } from '../../context-api/blog-context/UseBlog';
import BlogPostForm from './BlogPostForm';

function AddPost() {
  const { createBlog } = useBlog();
  const navigate = useNavigate();

  const handleSubmit = async (form) => {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    form.categories.forEach(cat => formData.append('categories', cat));
    formData.append('status', form.status);
    if (form.image) formData.append('image', await compressImage(form.image));
    // On failure the form keeps its content and shows the error, so the author can retry
    const created = await createBlog(formData);
    if (created) navigate('/app/blogposts');
  };

  return <BlogPostForm submitLabel="Save post" busyLabel="Saving…" onSubmit={handleSubmit} />;
}

export default AddPost;
