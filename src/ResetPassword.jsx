import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import TopHeader from './assets/components/TopHeader';
import MainHeader from './assets/components/MainHeader';
import { Helmet } from 'react-helmet'
import { API_BASE_URL } from './config/api';

const MIN_PASSWORD_LENGTH = 8;

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');
    if (password.length < MIN_PASSWORD_LENGTH) {
      setLocalError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (res.ok) {
        setLocalSuccess(data.message || 'Password has been reset.');
        setPassword('');
        setConfirmPassword('');
      } else {
        setLocalError(data.error || 'Failed to reset password.');
      }
    } catch {
      setLocalError('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Helmet>
      <title>Reset Password - Posh Choice Store</title>
    </Helmet>
      <TopHeader />
      <MainHeader />
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-100 py-8">
        <form
          className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-[#0A1F44]">Reset Your Password</h2>
          {localError && <div className="text-red-600 text-center mb-4">{localError}</div>}
          {localSuccess && (
            <div className="text-green-600 text-center mb-4">
              {localSuccess} <Link to="/login" className="text-blue-500 hover:underline">Log in</Link>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="At least 8 characters"
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Repeat the new password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full transition text-lg cursor-pointer"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <div className="mt-4 text-center">
            <Link to="/forgetpassword" className="text-blue-500 hover:underline text-sm">Request a new link</Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default ResetPassword;
