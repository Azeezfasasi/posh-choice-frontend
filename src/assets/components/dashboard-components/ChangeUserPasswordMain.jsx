import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, KeyRound, Lock, Search } from 'lucide-react';
import { useUser } from '../../context-api/user-context/UseUser';
import { Avatar, RoleBadge } from './UserAdminUI';
import { ResetPasswordForm } from './UserForms';
import { canManage, userId, usersApi } from './userAdmin';

function ChangeUserPasswordMain() {
  const { user: me } = useUser();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState('');

  const { data: users = [], isPending, isError, refetch } = useQuery({ queryKey: ['adminUsers'], queryFn: usersApi.list });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users
      .filter(u => userId(u) !== userId(me)) // your own password is changed from your profile
      .filter(u => !term || [u.name, u.email].some(v => v && v.toLowerCase().includes(term)))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [users, search, me]);

  const choose = (u) => { setSelected(u); setDone(''); };

  return (
    <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-6 items-start">
      {/* User picker */}
      <section className="min-w-0 rounded-2xl border border-line bg-white">
        <div className="p-4 border-b border-line">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-ink-soft mb-3">1. Choose a user</h2>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email" aria-label="Search users"
              className="w-full h-10 pl-10 pr-3 rounded-full border border-line bg-cream text-sm focus:bg-white" />
          </div>
        </div>
        <div className="max-h-[32rem] overflow-y-auto p-2">
          {isPending ? (
            <div className="space-y-2 p-2" aria-busy="true">{[0, 1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-cream animate-pulse" />)}</div>
          ) : isError ? (
            <p className="p-4 text-sm text-red-700">Couldn't load users. <button type="button" onClick={() => refetch()} className="font-semibold underline">Retry</button></p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-soft">No users found.</p>
          ) : (
            <ul className="space-y-1" role="listbox" aria-label="Users">
              {filtered.map(u => {
                const allowed = canManage(me, u);
                const active = selected && userId(selected) === userId(u);
                return (
                  <li key={userId(u)}>
                    <button type="button" role="option" aria-selected={active} disabled={!allowed} onClick={() => choose(u)}
                      title={allowed ? undefined : 'Only a super admin can reset admin passwords'}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition disabled:opacity-50 disabled:cursor-not-allowed ${active ? 'bg-plum-50 ring-1 ring-plum-200' : 'hover:bg-cream'}`}>
                      <Avatar name={u.name} size="w-9 h-9" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-ink truncate">{u.name}</span>
                        <span className="block text-xs text-ink-soft truncate">{u.email}</span>
                      </span>
                      {allowed ? <RoleBadge role={u.role} /> : <Lock className="w-4 h-4 text-ink-soft" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Form */}
      <section className="min-w-0 rounded-2xl border border-line bg-white p-5 md:p-6">
        <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-ink-soft mb-4">2. Set a new password</h2>
        {done && (
          <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> {done}
          </div>
        )}
        {selected ? (
          <>
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-cream px-4 py-3">
              <Avatar name={selected.name} />
              <div className="min-w-0">
                <p className="font-semibold text-ink truncate">{selected.name}</p>
                <p className="text-sm text-ink-soft truncate">{selected.email}</p>
              </div>
              <span className="ml-auto"><RoleBadge role={selected.role} /></span>
            </div>
            <ResetPasswordForm key={userId(selected)} user={selected} onDone={(message) => setDone(message)} />
          </>
        ) : (
          <div className="py-12 text-center">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-plum-50 text-plum-600 mb-3"><KeyRound className="w-6 h-6" /></span>
            <p className="font-semibold text-ink">Pick someone from the list</p>
            <p className="mt-1 text-sm text-ink-soft max-w-sm mx-auto">Use this when a customer or team member can't get into their account and can't use "Forgot password".</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ChangeUserPasswordMain;
