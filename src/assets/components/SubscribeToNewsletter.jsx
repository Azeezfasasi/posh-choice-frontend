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
    <>
    <div className="flex-1">
        <h3 className="text-lg font-semibold mb-3">Subscribe to Our Newsletter</h3>
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit}>
        <input
            type="email"
            placeholder="Your email address"
            className="px-3 py-2 rounded text-[white] focus:outline-white borde border-solid border-white outline"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={mutation.isLoading}
        />
        <button
            type="submit"
            className="bg-[#00B9F1] hover:bg-[#00A1D1] text-white px-4 py-2 rounded transition cursor-pointer"
            disabled={mutation.isLoading}
        >
            {mutation.isLoading ? 'Subscribing...' : 'Subscribe'}
        </button>
        </form>
        {success && <p className="text-green-400 text-xs mt-2">{success}</p>}
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <p className="text-xs text-gray-300 mt-2">Get the latest updates and offers.</p>
    </div>   
    </>
  )
}

export default SubscribeToNewsletter