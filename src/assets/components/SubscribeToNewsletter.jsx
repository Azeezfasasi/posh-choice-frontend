import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

function SubscribeToNewsletter() {
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
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-4">Stay in the loop</h3>
      <p className="text-sm text-white/65 mb-4">New arrivals, offers and gift ideas. No spam, unsubscribe any time.</p>
      <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit}>
        <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
        <input
          id="footer-newsletter-email"
          type="email"
          placeholder="Your email address"
          className="flex-1 min-w-0 h-11 px-4 rounded-full bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/45 focus:outline-none focus:border-gold focus:bg-white/15 transition"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={mutation.isPending}
        />
        <button
          type="submit"
          className="h-11 px-6 rounded-full bg-gold text-ink text-sm font-semibold hover:bg-[#d6b25e] transition disabled:opacity-60 cursor-pointer"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      <div aria-live="polite">
        {success && <p className="text-emerald-300 text-xs mt-2">{success}</p>}
        {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
      </div>
    </div>
  )
}

export default SubscribeToNewsletter