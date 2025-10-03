import React, { useState, useEffect } from 'react';
import { useQuote } from '../context-api/Request-quote-context/UseQuote';

function RequestQuote() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const { submitQuote, loading, error, success } = useQuote();

   useEffect(() => {
    if (success) {
      setForm({ name: '', email: '', phone: '', service: '', message: '' });
    }
  }, [success]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitQuote(form);
    if (success) setForm({ name: '', email: '', phone: '', service: '', message: '' });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 font-inter flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Section */}
          <div className="flex flex-col justify-center text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-gray-800 leading-tight mb-6">
              Need Quality Gift Items or Household Items?
            </h2>
            <p className='font-semibold text-[18px]'>Get in Touch with Posh Choice Store Today!</p>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
              Looking for durable gift items, home equipment, kitchen appliances, or other household essentials? We've got you covered with a wide variety of reliable and affordable products for your home and business.
              <br />
              Have a question, need a quote, or ready to place an order? We're just a call or message away.
              Contact us today using the details below or fill out our quick inquiry form — we'll get back to you promptly.
            </p>
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8 mt-8">
              <div className="flex items-center space-x-3">
                {/* Phone icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone text-purple-500">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span className="text-gray-700">Fast Service: <a href="tel:08029580850" className="text-purple-500 hover:underline">(+234) 08157574797</a></span>
              </div>
              <div className="flex items-center space-x-3">
                {/* Mail icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail text-purple-500">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <span className="text-gray-700"><a href="mailto:info@poshchoicestore.com.ng" className="text-purple-500 hover:underline">info@poshchoicestore.com.ng</a></span>
              </div>
            </div>
          </div>

          {/* Right Section: Free Quote Form */}
          <div className="bg-gray-50 p-8 rounded-3xl shadow-xl w-full max-w-lg mx-auto border border-solid border-gray-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center lg:text-left">Free Quote Request</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {success && <p className="text-green-600 text-center mt-2">{success}</p>}
              {error && <p className="text-red-600 text-center mt-2">{error}</p>}
              <div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <input
                  type="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Your Phone Number"
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <select
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Product Category</option>
                  <option value="Plastic Chairs">Plastic Chairs</option>
                  <option value="Plastic Tables">Plastic Tables</option>
                  <option value="Plastic Storage Containers">Plastic Storage Containers</option>
                  <option value="Kitchenware & Household Plastics">Kitchenware & Household Plastics</option>
                  <option value="Home Equipment">Home Equipment</option>
                  <option value="Wholesale / Bulk Order">Wholesale / Bulk Order</option>                  
                  <option value="Custom Plastic Items">Custom Plastic Items</option>
                  <option value="Data Recovery">Others</option>
                </select>
              </div>
              <div>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Service Needed"
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                <span>{loading ? 'Sending...' : 'Request Quote'}</span>
                {/* Phone icon for the button */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone-call">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default RequestQuote;