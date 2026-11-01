import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet'
import TopHeader from './assets/components/TopHeader';
import MainHeader from './assets/components/MainHeader';

function NotFound() {
  return (
    <>
    <Helmet>
      <title>Page Not Found - Posh Choice Store</title>
    </Helmet>
      <TopHeader />
      <MainHeader />
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-100 py-8 px-4 text-center">
        <h1 className="text-5xl font-bold text-[#0A1F44] mb-4">404</h1>
        <p className="text-gray-600 mb-6">Sorry, we couldn't find that page.</p>
        <Link to="/" className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full transition">
          Back to Home
        </Link>
      </div>
    </>
  );
}

export default NotFound;
