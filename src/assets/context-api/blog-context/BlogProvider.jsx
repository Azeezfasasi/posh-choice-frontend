import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { BlogContext } from './BlogContext';
import { API_BASE_URL } from '../../../config/api';
import { UserContext } from '../user-context/UserContext';

export const BlogProvider = ({ children }) => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useContext(UserContext);

  // Fetch all blogs on mount
  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  // Fetch blogs
  const fetchBlogs = async (params = {}) => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/blog`, { params });
      setBlogs(res.data);
    } catch (err) {
      console.log(err);
      setError('Failed to fetch blogs.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/blog/categories`);
      setCategories(res.data);
    } catch (err) {
      console.log(err);
      setCategories([]);
    }
  };

  // Create blog (with image)
  const createBlog = async (formData) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await axios.post(`${API_BASE_URL}/blog`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess('Blog created!');
      fetchBlogs();
      return res.data;
    } catch (err) {
      console.log(err);
      setError('Failed to create blog.');
    } finally {
      setLoading(false);
    }
  };

  // Edit blog (with image)
  const editBlog = async (id, formData) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await axios.put(`${API_BASE_URL}/blog/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess('Blog updated!');
      fetchBlogs();
      return res.data;
    } catch (err) {
      console.log(err);
      setError('Failed to update blog.');
    } finally {
      setLoading(false);
    }
  };

  // Delete blog
  const deleteBlog = async (id) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      await axios.delete(`${API_BASE_URL}/blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Blog deleted!');
      fetchBlogs();
    } catch (err) {
      console.log(err);
      setError('Failed to delete blog.');
    } finally {
      setLoading(false);
    }
  };

  // Change blog status
  const changeStatus = async (id, status) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await axios.patch(`${API_BASE_URL}/blog/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Status updated!');
      fetchBlogs();
      return res.data;
    } catch (err) {
      console.log(err);
      setError('Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  // Get single blog
  const getBlog = async (id) => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/blog/${id}`);
      return res.data;
    } catch (err) {
      console.log(err);
      setError('Failed to fetch blog.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlogContext.Provider value={{
      blogs, categories, loading, error, success,
      fetchBlogs, fetchCategories, createBlog, editBlog, deleteBlog, changeStatus, getBlog
    }}>
      {children}
    </BlogContext.Provider>
  );
};
