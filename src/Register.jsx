import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './assets/context-api/user-context/UseUser';
import AuthLayout, { AuthField, PasswordField, authButtonClass } from './assets/components/AuthLayout';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const { register, loading, error, user } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    await register(form);
  };

  useEffect(() => {
    if (user) {
      navigate('/app/dashboard');
    }
  }, [user, navigate]);

  return (
    <>
      <Helmet>
        <title>Create an account - Posh Choice Store</title>
      </Helmet>
      <AuthLayout title="Create your account" subtitle="It only takes a minute. You can still check out as a guest any time.">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {submitted && error && (
            <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>
          )}
          <AuthField
            label="Full name"
            id="register-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            autoComplete="name"
            required
          />
          <AuthField
            label="Email address"
            id="register-email"
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
            id="register-password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            autoComplete="new-password"
            minLength={8}
            hint="At least 8 characters."
            required
          />
          <button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-ink-soft">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-plum-700 hover:text-plum-800">Sign in</Link>
        </p>
      </AuthLayout>
    </>
  );
}

export default Register;
