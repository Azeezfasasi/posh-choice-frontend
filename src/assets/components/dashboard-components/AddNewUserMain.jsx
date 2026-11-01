import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useUser } from '../../context-api/user-context/UseUser';
import { UserForm } from './UserForms';

function AddNewUserMain() {
  const { isAdmin, isSuperAdmin } = useUser();
  const queryClient = useQueryClient();
  const [created, setCreated] = useState('');
  const [formKey, setFormKey] = useState(0);

  // Non-admins are redirected by the AdminRoute guard in App.jsx
  if (!isAdmin) return null;

  const done = (message) => {
    queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    setCreated(message);
    setFormKey(k => k + 1); // fresh form for the next user
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
      <div className="min-w-0 space-y-5">
        <Link to="/app/allusers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> All users
        </Link>

        {created && (
          <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-900">{created}</p>
              <p className="text-emerald-800">Share the sign-in details with them privately. <Link to="/app/allusers" className="font-semibold underline">View all users</Link></p>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
          <h2 className="font-sans text-lg font-semibold text-ink">Account details</h2>
          <p className="text-sm text-ink-soft mb-5">Create an account for a customer or a member of your team.</p>
          <UserForm key={formKey} onDone={done} />
        </section>
      </div>

      <aside className="rounded-2xl border border-line bg-white p-5 space-y-4 text-sm">
        <h2 className="flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-wider text-ink-soft">
          <ShieldCheck className="w-4 h-4" /> About roles
        </h2>
        <dl className="space-y-3">
          <div><dt className="font-semibold text-ink">Customer</dt><dd className="text-ink-soft">Can shop, track orders and use a wishlist.</dd></div>
          <div><dt className="font-semibold text-ink">Admin</dt><dd className="text-ink-soft">Manages orders, products, content and customer accounts.</dd></div>
          <div><dt className="font-semibold text-ink">Super admin</dt><dd className="text-ink-soft">Everything an admin can do, plus managing admin accounts.</dd></div>
        </dl>
        {!isSuperAdmin && <p className="rounded-xl bg-cream px-3 py-2 text-xs text-ink-soft">Only a super admin can create admin accounts.</p>}
      </aside>
    </div>
  );
}

export default AddNewUserMain;
