import React, { useState } from 'react';
import TopHeader from './assets/components/TopHeader';
import MainHeader from './assets/components/MainHeader';
import { useUser } from './assets/context-api/user-context/UseUser';
import { Helmet } from 'react-helmet'
import { API_BASE_URL } from './config/api';

function ForgetPassword() {
  const [email, setEmail] = useState('');
  const { loading, error, success } = useUser();
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');
    if (!email) {
      setLocalError('Please enter your email.');
      return;
    }
    try {
      // Call backend endpoint for password reset
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${API_BASE_URL}`}/users/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setLocalSuccess(data.message || 'Password reset email sent!');
      } else {
        setLocalError(data.error || 'Failed to send reset email.');
      }
    } catch (err) {
      console.log(err);
      setLocalError('Failed to send reset email.');
    }
  };

  return (
    <>
    <Helmet>
      <title>Forget Password - Posh Choice Store</title>
    </Helmet>
      <TopHeader />
      <MainHeader />
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-100 py-8">
        <form
          className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-[#0A1F44]">Forgot Your Password?</h2>
          <p className="text-gray-600 text-center mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          {(localError || error) && <div className="text-red-600 text-center mb-4">{localError || error}</div>}
          {(localSuccess || success) && <div className="text-green-600 text-center mb-4">{localSuccess || success}</div>}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full transition text-lg cursor-pointer"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <div className="mt-4 text-center">
            <a href="/login" className="text-blue-500 hover:underline text-sm">Back to login</a>
          </div>
        </form>
      </div>
    </>
  );
}

export default ForgetPassword;