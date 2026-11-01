import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './assets/context-api/user-context/UseUser';
import { Helmet } from 'react-helmet';
import AuthLayout, { AuthField, PasswordField, authButtonClass } from './assets/components/AuthLayout';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const { login, loading, error, user } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
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
      <title>Sign in - Posh Choice Store</title>
    </Helmet>
    <AuthLayout title="Welcome back" subtitle="Sign in to track orders, manage your wishlist and check out faster.">
      <form className="space-y-5" onSubmit={handleSubmit} noValidate={false}>
        {submitted && error && (
          <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        <AuthField
          label="Email address"
          id="login-email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <PasswordField
          label="Password"
          id="login-password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Your password"
          autoComplete="current-password"
          required
          labelAction={<Link to="/forgetpassword" className="text-sm font-medium text-plum-700 hover:text-plum-800">Forgot password?</Link>}
        />
        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-ink-soft">
        New to Posh Choice?{' '}
        <Link to="/register" className="font-semibold text-plum-700 hover:text-plum-800">Create an account</Link>
      </p>
      <p className="mt-3 text-center text-xs text-ink-soft">
        You can also <Link to="/app/shop" className="underline underline-offset-2 hover:text-ink">shop</Link> and check out as a guest.
      </p>
    </AuthLayout>
    </>
  );
}

export default Login;
