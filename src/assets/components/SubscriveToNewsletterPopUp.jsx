import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

function SubscribeToNewsletterPopUp() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (email) => {
      const res = await axios.post(`${API_BASE_URL}/newsletter/subscribe`, { email });
      return res.data;
    },
    onSuccess: (data) => {
      setSuccess(data.message || 'Subscribed successfully!');
      setError('');
      setEmail('');
    },
    onError: (err) => {
      setError(err?.response?.data?.error || 'Subscription failed.');
      setSuccess('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    mutation.mutate(email);
  };

  return (
    <div className="w-full">
      <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit}>
        <label htmlFor="popup-newsletter-email" className="sr-only">Email address</label>
        <input
          id="popup-newsletter-email"
          type="email"
          placeholder="Your email address"
          className="flex-1 min-w-0 h-12 px-4 rounded-full bg-cream border border-line text-sm text-ink placeholder:text-ink-soft/80 focus:outline-none focus:bg-white focus:border-plum-400 focus:ring-4 focus:ring-plum-100 transition"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={mutation.isPending}
        />
        <button
          type="submit"
          className="h-12 px-6 rounded-full bg-plum-600 hover:bg-plum-700 text-white text-sm font-semibold transition disabled:opacity-60 cursor-pointer"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      <div aria-live="polite" className="text-center">
        {success && <p className="text-emerald-600 text-sm mt-3">{success}</p>}
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      </div>
    </div>
  )
}

export default SubscribeToNewsletterPopUp