import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { QuoteContext } from './Request-quote-context/QuoteContext';
import { API_BASE_URL } from '../../config/api';
import { UserContext } from './user-context/UserContext';

export const QuoteProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quotes, setQuotes] = useState([]);
  const { token } = useContext(UserContext); // Use context directly

  useEffect(() => {
    if (token) {
      fetchQuotes();
    }
    // Only run when token changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Submit a new quote request
  const submitQuote = async (form) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(
        `${API_BASE_URL}/quote`,
        form
      );
      setSuccess(res.data.message || 'Quote request sent!');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to send quote request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
  setLoading(true);
  setError('');
  try {
    console.log('Fetching quotes...');
    const res = await axios.get(`${API_BASE_URL}/quotes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Quotes response:', res);
    setQuotes(res.data);
    return res.data;
  } catch (err) {
    console.log('Fetch quotes error:', err.response || err.data);
    setError('Failed to fetch quote requests.');
  } finally {
    setLoading(false);
  }
};

  // Delete a quote request by ID
  const deleteQuote = async (id) => {
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/quotes/${id}`);
      setQuotes((prev) => prev.filter((q) => q._id !== id));
      setSuccess('Quote request deleted.');
    } catch (err) {
      console.log(err);
      setError('Failed to delete quote request.');
    } finally {
      setLoading(false);
    }
  };

  // Update a quote request (edit details or status)
  const updateQuote = async (id, updates) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.put(`${API_BASE_URL}/quotes/${id}`, updates);
      setQuotes((prev) => prev.map((q) => (q._id === id ? res.data : q)));
      setSuccess('Quote request updated.');
    } catch (err) {
      console.log(err);
      setError('Failed to update quote request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuoteContext.Provider value={{
      submitQuote,
      fetchQuotes,
      deleteQuote,
      updateQuote,
      quotes,
      loading,
      error,
      success
    }}>
      {children}
    </QuoteContext.Provider>
  );
};