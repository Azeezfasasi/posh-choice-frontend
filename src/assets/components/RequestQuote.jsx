import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, PackageCheck, Send, Sparkles, Users } from 'lucide-react';
import { useQuote } from '../context-api/Request-quote-context/UseQuote';

const CATEGORIES = [
  'Gift items & souvenirs',
  'Corporate / event gifting',
  'Kitchen appliances',
  'Kitchen equipment',
  'Household appliances',
  'Kids party packs',
  'Snacks',
  'Wholesale / bulk order',
  'Other',
];

const POINTS = [
  { icon: PackageCheck, text: 'Special pricing on bulk and repeat orders' },
  { icon: Users, text: 'Gifting for offices, weddings, parties and events' },
  { icon: Sparkles, text: 'Help choosing the right products for your budget' },
];

const inputClass = 'w-full h-12 px-4 rounded-xl border border-line bg-white text-ink placeholder:text-ink-soft/70 focus:outline-none focus:border-plum-400 focus:ring-4 focus:ring-plum-100 transition';

function RequestQuote() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const { submitQuote, loading, error, success } = useQuote();

  useEffect(() => {
    if (success && submitted) {
      setForm({ name: '', email: '', phone: '', service: '', message: '' });
    }
  }, [success, submitted]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    await submitQuote(form);
  };

  return (
    <section className="bg-cream border-t border-line" id="quote">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div className="lg:pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Request a quote</p>
          <h2 className="font-display mt-3 text-3xl md:text-4xl font-semibold text-ink leading-tight">
            Buying in bulk or for an event? Tell us what you need.
          </h2>
          <p className="mt-4 text-ink-soft leading-relaxed max-w-lg">
            From gift items and souvenirs to kitchenware and household essentials, we'll put together a quote for your home,
            business or celebration and get back to you promptly.
          </p>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ icon, text }) => {
              const Icon = icon;
              return (
                <li key={text} className="flex items-center gap-3 text-ink">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-line text-plum-600">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  {text}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-3xl bg-white border border-line p-6 sm:p-8 shadow-[0_12px_40px_-20px_rgba(15,27,61,0.25)]">
          {submitted && success ? (
            <div className="py-10 text-center" role="status">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </span>
              <h3 className="font-display text-2xl font-semibold text-ink">Request sent</h3>
              <p className="mt-2 text-ink-soft">Thank you! We've emailed you a confirmation and will be in touch shortly.</p>
              <button type="button" onClick={() => setSubmitted(false)} className="mt-6 text-sm font-semibold text-plum-700 hover:text-plum-800">
                Send another request
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <h3 className="font-display text-2xl font-semibold text-ink mb-2">Free quote request</h3>
              {submitted && error && (
                <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>
              )}
              <div>
                <label htmlFor="quote-name" className="block text-sm font-medium text-ink mb-1.5">Full name</label>
                <input id="quote-name" type="text" name="name" value={form.name} onChange={handleChange} autoComplete="name" className={inputClass} required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quote-email" className="block text-sm font-medium text-ink mb-1.5">Email</label>
                  <input id="quote-email" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" className={inputClass} required />
                </div>
                <div>
                  <label htmlFor="quote-phone" className="block text-sm font-medium text-ink mb-1.5">Phone number</label>
                  <input id="quote-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" className={inputClass} required />
                </div>
              </div>
              <div>
                <label htmlFor="quote-service" className="block text-sm font-medium text-ink mb-1.5">What are you looking for?</label>
                <select id="quote-service" name="service" value={form.service} onChange={handleChange} className={inputClass} required>
                  <option value="">Choose a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="quote-message" className="block text-sm font-medium text-ink mb-1.5">Details</label>
                <textarea
                  id="quote-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Items, quantities, delivery location and date, budget…"
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink placeholder:text-ink-soft/70 focus:outline-none focus:border-plum-400 focus:ring-4 focus:ring-plum-100 transition resize-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-plum-600 text-white font-semibold hover:bg-plum-700 transition disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Sending…' : 'Request a quote'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default RequestQuote;
