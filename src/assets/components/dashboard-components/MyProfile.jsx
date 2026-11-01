import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Heart, KeyRound, Loader2, Mail, MapPin, MapPinned, Pencil, Phone, ShieldCheck, ShoppingBag, UserRound,
} from 'lucide-react';
import { useUser } from '../../context-api/user-context/UseUser';
import { Toast } from './NewsletterUI';
import { Avatar, Field, RoleBadge } from './UserAdminUI';
import { errorMessage, inputClass } from './userAdmin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIO_MAX = 300;
const FIELDS = ['name', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'bio'];

const toForm = (user) => Object.fromEntries(FIELDS.map(k => [k, user?.[k] || '']));
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : null);

function Detail({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span className="mt-0.5 inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-cream text-ink-soft">
        {React.createElement(icon, { className: 'w-4 h-4' })}
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wider text-ink-soft">{label}</dt>
        <dd className={`mt-0.5 text-sm break-words ${value ? 'text-ink' : 'text-ink-soft/70 italic'}`}>{value || 'Not added yet'}</dd>
      </div>
    </div>
  );
}

function MyProfile() {
  const { user, isAdmin, updateProfile } = useUser();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => toForm(user));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Keep the form in step with the session until the user starts editing
  useEffect(() => { if (!editing) setForm(toForm(user)); }, [user, editing]);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!user) {
    return <div className="max-w-5xl mx-auto h-64 rounded-2xl bg-white border border-line animate-pulse" aria-busy="true" />;
  }

  const set = (key, value) => { setForm(f => ({ ...f, [key]: value })); setErrors(e => ({ ...e, [key]: '' })); };
  const startEdit = () => { setForm(toForm(user)); setErrors({}); setServerError(''); setEditing(true); };
  const cancel = () => { setEditing(false); setErrors({}); setServerError(''); };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.name.trim()) e.name = 'Enter your name.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address.';
    if (form.bio.length > BIO_MAX) e.bio = `Keep it under ${BIO_MAX} characters.`;
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    setServerError('');
    try {
      await updateProfile(Object.fromEntries(FIELDS.map(k => [k, form[k].trim()])));
      setEditing(false);
      setToast({ type: 'success', text: 'Your profile was updated.' });
    } catch (err) {
      setServerError(errorMessage(err, 'Could not update your profile. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const location = [user.address, user.city, user.state, user.zipCode].filter(Boolean).join(', ');
  const filled = FIELDS.filter(k => user[k]).length;
  const completion = Math.round((filled / FIELDS.length) * 100);
  const missing = [!user.phone && 'phone number', !location && 'delivery address'].filter(Boolean);
  const memberSince = formatDate(user.createdAt);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Toast toast={toast} />

      {/* Identity */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-white">
        <div className="h-24 bg-gradient-to-r from-plum-700 via-plum-600 to-plum-500" aria-hidden="true" />
        <div className="px-5 md:px-6 pb-5 flex flex-col sm:flex-row sm:items-start gap-4">
          <span className="-mt-10"><Avatar name={user.name} size="w-20 h-20 ring-4 ring-white" text="text-2xl" /></span>
          <div className="min-w-0 flex-1 sm:pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl text-ink truncate">{user.name}</h2>
              <RoleBadge role={user.role} />
            </div>
            <p className="text-sm text-ink-soft truncate">{user.email}</p>
            {memberSince && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-ink-soft">
                <CalendarDays className="w-3.5 h-3.5" /> Member since {memberSince}
              </p>
            )}
          </div>
          {!editing && (
            <button type="button" onClick={startEdit}
              className="self-start sm:mt-4 inline-flex items-center gap-2 rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700">
              <Pencil className="w-4 h-4" /> Edit profile
            </button>
          )}
        </div>
      </section>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        {/* Details / edit form */}
        <section className="min-w-0 rounded-2xl border border-line bg-white p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <h2 className="font-sans text-lg font-semibold text-ink">{editing ? 'Edit your details' : 'Personal information'}</h2>
              <p className="text-sm text-ink-soft">
                {editing ? 'Your delivery details are used to speed up checkout.' : 'How we contact you and where we deliver.'}
              </p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={submit} noValidate className="mt-4 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" htmlFor="pf-name" error={errors.name}>
                  <input id="pf-name" value={form.name} onChange={e => set('name', e.target.value)} autoComplete="name" className={inputClass} />
                </Field>
                <Field label="Email" htmlFor="pf-email" error={errors.email}>
                  <input id="pf-email" type="email" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" className={inputClass} />
                </Field>
                <Field label="Phone" htmlFor="pf-phone" hint="Include your WhatsApp number if it's different.">
                  <input id="pf-phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} autoComplete="tel" placeholder="e.g. 0801 234 5678" className={inputClass} />
                </Field>
              </div>

              <div className="border-t border-line pt-5">
                <p className="text-sm font-semibold text-ink mb-3">Delivery address</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Field label="Street address" htmlFor="pf-address">
                      <input id="pf-address" value={form.address} onChange={e => set('address', e.target.value)} autoComplete="street-address" className={inputClass} />
                    </Field>
                  </div>
                  <Field label="City" htmlFor="pf-city">
                    <input id="pf-city" value={form.city} onChange={e => set('city', e.target.value)} autoComplete="address-level2" className={inputClass} />
                  </Field>
                  <Field label="State" htmlFor="pf-state">
                    <input id="pf-state" value={form.state} onChange={e => set('state', e.target.value)} autoComplete="address-level1" className={inputClass} />
                  </Field>
                  <Field label="Postal code" htmlFor="pf-zip">
                    <input id="pf-zip" value={form.zipCode} onChange={e => set('zipCode', e.target.value)} autoComplete="postal-code" className={inputClass} />
                  </Field>
                </div>
              </div>

              <div className="border-t border-line pt-5">
                <Field label="About you" htmlFor="pf-bio" error={errors.bio}>
                  <textarea id="pf-bio" rows={4} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="A short note about yourself (optional)"
                    className={`${inputClass} h-auto py-2.5 resize-y`} />
                </Field>
                <p className={`mt-1 text-right text-xs ${form.bio.length > BIO_MAX ? 'text-red-600' : 'text-ink-soft'}`}>{form.bio.length}/{BIO_MAX}</p>
              </div>

              {serverError && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{serverError}</p>}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button type="button" onClick={cancel} disabled={saving}
                  className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-plum-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-60">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <dl className="grid sm:grid-cols-2 sm:gap-x-6 divide-y divide-line sm:divide-y-0">
                <Detail icon={UserRound} label="Full name" value={user.name} />
                <Detail icon={Mail} label="Email" value={user.email} />
                <Detail icon={Phone} label="Phone" value={user.phone} />
                <Detail icon={MapPin} label="Delivery address" value={location} />
              </dl>
              <div className="mt-2 border-t border-line pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">About you</p>
                <p className={`mt-1 text-sm whitespace-pre-line ${user.bio ? 'text-ink' : 'text-ink-soft/70 italic'}`}>{user.bio || 'Nothing here yet.'}</p>
              </div>
            </>
          )}
        </section>

        {/* Side cards */}
        <aside className="space-y-6">
          {completion < 100 && (
            <section className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center justify-between text-sm">
                <h2 className="font-sans font-semibold text-ink">Profile completeness</h2>
                <span className="font-semibold text-plum-700">{completion}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-line overflow-hidden" role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
                <div className="h-full rounded-full bg-plum-600" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-3 text-xs text-ink-soft">
                {missing.length ? `Add your ${missing.join(' and ')} so we can reach you about your orders.` : 'A few optional details are still empty.'}
              </p>
              {!editing && <button type="button" onClick={startEdit} className="mt-3 text-sm font-semibold text-plum-700 hover:text-plum-800">Complete profile →</button>}
            </section>
          )}

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-wider text-ink-soft">
              <ShieldCheck className="w-4 h-4" /> Sign-in & security
            </h2>
            <div className="mt-4 flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-plum-50 text-plum-600"><KeyRound className="w-4 h-4" /></span>
              <div className="text-sm">
                <p className="font-semibold text-ink">Password</p>
                <p className="text-ink-soft">We'll email you a secure link to set a new one.</p>
                <Link to="/forgetpassword" className="mt-2 inline-block font-semibold text-plum-700 hover:text-plum-800">Change password →</Link>
              </div>
            </div>
          </section>

          {!isAdmin && (
            <section className="rounded-2xl border border-line bg-white p-2">
              {[
                { to: '/app/userorderdetails', label: 'My orders', icon: ShoppingBag },
                { to: '/app/wishlist', label: 'Wishlist', icon: Heart },
                { to: '/app/trackorder', label: 'Track an order', icon: MapPinned },
              ].map(({ to, label, icon }) => (
                <Link key={to} to={to} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-cream">
                  {React.createElement(icon, { className: 'w-4 h-4 text-plum-600' })} {label}
                  <span className="ml-auto text-ink-soft" aria-hidden="true">→</span>
                </Link>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

export default MyProfile;
