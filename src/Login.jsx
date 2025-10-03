import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopHeader from './assets/components/TopHeader';
import MainHeader from './assets/components/MainHeader';
import { useUser } from './assets/context-api/user-context/UseUser';
import { Helmet } from 'react-helmet';
import Footer from './assets/components/Footer';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading, error, success, user } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form);
  };

  useEffect(() => {
    if (user) {
      navigate('/app/dashboard');
    }
  }, [user, navigate]);

  return (
    <>
    <Helmet>
      <title>Login - Posh Choice Store</title>
    </Helmet>
      <TopHeader />
      <MainHeader />
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-100 py-8">
        <form
          className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-[#0A1F44]">Sign In to Your Account</h2>
          {error && <div className="text-red-600 text-center mb-4">{error}</div>}
          {success && <div className="text-green-600 text-center mb-4">{success}</div>}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full transition text-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="mt-4 text-center">
            <Link to="/forgetpassword" className="text-blue-500 hover:underline text-sm">Forgot password?</Link>
          </div>
          <div className="flex flex-row justify-center items-center gap-1 mt-4 text-center text-black font-semibold">
            <span>Don't have an account?</span>
            <Link to="/register" className='text-purple-500  hover:underline text-sm'>
                Register
            </Link>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default Login;