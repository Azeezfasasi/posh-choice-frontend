import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, KeyRound, MoreHorizontal, Pencil, Search, ShieldCheck, Trash2, UserCheck, UserPlus, UserX, Users } from 'lucide-react';
import { useUser } from '../../context-api/user-context/UseUser';
import { Avatar, RoleBadge } from './UserAdminUI';
import { ResetPasswordForm, UserForm } from './UserForms';
import { ConfirmDialog, Drawer, Toast } from './NewsletterUI';
import { ADMIN_ROLES, canManage, errorMessage, userId, usersApi } from './userAdmin';

const PAGE_SIZE = 15;
const shortDate = (d) => (d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const isActive = (u) => u.isActive !== false;

const TABS = [
  { value: 'all', label: 'All', test: () => true },
  { value: 'customers', label: 'Customers', test: (u) => !ADMIN_ROLES.includes(u.role) },
  { value: 'admins', label: 'Admins', test: (u) => ADMIN_ROLES.includes(u.role) },
  { value: 'disabled', label: 'Disabled', test: (u) => !isActive(u) },
];

const SORTS = {
  newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  oldest: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  name: (a, b) => (a.name || '').localeCompare(b.name || ''),
};

function RowMenu({ user, me, onEdit, onReset, onToggle, onDelete }) {
  const [pos, setPos] = useState(null); // fixed position of the open menu
  const ref = useRef(null);
  const buttonRef = useRef(null);
  const open = Boolean(pos);

  // The menu is positioned against the viewport so the table's scroll area can't clip it
  const place = () => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (!r) return;
    const menuHeight = 250;
    const top = r.bottom + menuHeight + 8 > window.innerHeight ? Math.max(8, r.top - menuHeight - 4) : r.bottom + 4;
    setPos({ top, right: window.innerWidth - r.right });
  };
  const toggle = () => (open ? setPos(null) : place());
  const setOpen = (value) => { if (!value) setPos(null); };

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setPos(null); };
    const onKey = (e) => { if (e.key === 'Escape') setPos(null); };
    const onScroll = () => place(); // keep the menu attached to its button
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const self = userId(user) === userId(me);
  const allowed = canManage(me, user);
  const item = 'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left rounded-lg disabled:opacity-40 disabled:cursor-not-allowed';
  const run = (fn) => () => { setOpen(false); fn(user); };

  return (
    <div className="relative" ref={ref}>
      <button ref={buttonRef} type="button" onClick={toggle} aria-haspopup="menu" aria-expanded={open} aria-label={`Actions for ${user.name}`}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full text-ink hover:bg-plum-50 hover:text-plum-700">
        <MoreHorizontal className="w-5 h-5" />
      </button>
      {open && (
        <div role="menu" style={{ top: pos.top, right: pos.right }} className="fixed z-40 w-52 rounded-xl border border-line bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(15,27,61,0.25)]">
          <button role="menuitem" type="button" disabled={!allowed} onClick={run(onEdit)} className={`${item} text-ink hover:bg-cream`}><Pencil className="w-4 h-4" /> Edit details</button>
          <button role="menuitem" type="button" disabled={!allowed} onClick={run(onReset)} className={`${item} text-ink hover:bg-cream`}><KeyRound className="w-4 h-4" /> Reset password</button>
          <button role="menuitem" type="button" disabled={!allowed || self} onClick={run(onToggle)} className={`${item} text-ink hover:bg-cream`}>
            {isActive(user) ? <><UserX className="w-4 h-4" /> Disable account</> : <><UserCheck className="w-4 h-4" /> Enable account</>}
          </button>
          <div className="my-1 border-t border-line" />
          <button role="menuitem" type="button" disabled={!allowed || self} onClick={run(onDelete)} className={`${item} text-red-600 hover:bg-red-50`}><Trash2 className="w-4 h-4" /> Delete user</button>
          {!allowed && <p className="px-3 pt-1.5 pb-1 text-[11px] text-ink-soft">Only a super admin can manage admin accounts.</p>}
          {allowed && self && <p className="px-3 pt-1.5 pb-1 text-[11px] text-ink-soft">You can't disable or delete your own account.</p>}
        </div>
      )}
    </div>
  );
}

function AllUserMain() {
  const { user: me } = useUser();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState(null); // { type: 'create' | 'edit' | 'reset', user? }
  const [confirm, setConfirm] = useState(null); // { type: 'delete' | 'disable', user }
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const { data: users = [], isPending, isError, refetch } = useQuery({ queryKey: ['adminUsers'], queryFn: usersApi.list });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] });

  const statusMutation = useMutation({
    mutationFn: (u) => (isActive(u) ? usersApi.disable(userId(u)) : usersApi.enable(userId(u))),
    onSuccess: (_, u) => { refresh(); setConfirm(null); showToast('success', isActive(u) ? `${u.name} can no longer sign in.` : `${u.name} can sign in again.`); },
    onError: (err) => { setConfirm(null); showToast('error', errorMessage(err, 'Could not change account status.')); },
  });
  const deleteMutation = useMutation({
    mutationFn: (u) => usersApi.remove(userId(u)),
    onSuccess: (_, u) => { refresh(); setConfirm(null); showToast('success', `${u.name} was deleted.`); },
    onError: (err) => { setConfirm(null); showToast('error', errorMessage(err, 'Could not delete this user.')); },
  });

  const counts = useMemo(() => Object.fromEntries(TABS.map(t => [t.value, users.filter(t.test).length])), [users]);
  const newThisMonth = users.filter(u => {
    const d = new Date(u.createdAt); const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const test = TABS.find(t => t.value === tab).test;
    return users
      .filter(test)
      .filter(u => !term || [u.name, u.email, u.phone].some(v => v && v.toLowerCase().includes(term)))
      .sort(SORTS[sort]);
  }, [users, tab, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const panelDone = (message) => { refresh(); setPanel(null); showToast('success', message); };

  return (
    <div className="space-y-5">
      <Toast toast={toast} />

      {/* Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {[
          ['Customers', counts.customers, Users],
          ['New this month', newThisMonth, UserPlus],
          ['Admins', counts.admins, ShieldCheck],
          ['Disabled', counts.disabled, UserX],
        ].map(([label, value, icon]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs md:text-sm text-ink-soft">{label}</p>
              <p className="mt-1 text-xl md:text-2xl font-bold text-ink tabular-nums">{isPending ? '…' : value}</p>
            </div>
            <span className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-xl bg-plum-50 text-plum-600">
              {React.createElement(icon, { className: 'w-5 h-5' })}
            </span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Filter users">
          {TABS.map(t => (
            <button key={t.value} type="button" role="tab" aria-selected={tab === t.value} onClick={() => { setTab(t.value); setPage(1); }}
              className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${tab === t.value ? 'border-plum-600 bg-plum-600 text-white' : 'border-line bg-white text-ink hover:border-plum-300'}`}>
              {t.label}
              <span className={`rounded-full px-1.5 text-xs font-semibold ${tab === t.value ? 'bg-white/20' : 'bg-cream text-ink-soft'}`}>{counts[t.value] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 lg:ml-auto">
          <div className="relative flex-1 min-w-[12rem] lg:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
            <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email or phone"
              aria-label="Search users" className="w-full h-10 pl-10 pr-3 rounded-full border border-line bg-white text-sm" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort users" className="h-10 rounded-full border border-line bg-white px-4 text-sm">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
          </select>
          <button type="button" onClick={() => setPanel({ type: 'create' })}
            className="shrink-0 inline-flex items-center gap-2 h-10 rounded-full bg-plum-600 px-5 text-sm font-semibold text-white hover:bg-plum-700">
            <UserPlus className="w-4 h-4" /> Add user
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-line bg-white">
        {isPending ? (
          <div className="p-4 space-y-2" aria-busy="true">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-cream animate-pulse" />)}</div>
        ) : isError ? (
          <p role="alert" className="p-6 text-center text-sm text-red-700">We couldn't load users. <button type="button" onClick={() => refetch()} className="font-semibold underline">Try again</button></p>
        ) : rows.length === 0 ? (
          <p className="py-14 text-center text-ink-soft">{search ? 'No users match your search.' : 'No users here yet.'}</p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider border-b border-line">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(u => (
                  <tr key={userId(u)} className="hover:bg-cream/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} />
                        <div className="min-w-0">
                          <p className="font-medium text-ink truncate max-w-[14rem]">
                            {u.name}{userId(u) === userId(me) && <span className="ml-1.5 text-xs font-normal text-ink-soft">(you)</span>}
                          </p>
                          <p className="text-xs text-ink-soft truncate max-w-[16rem]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{shortDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${isActive(u) ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-red-50 text-red-700 ring-red-200'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
                        {isActive(u) ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RowMenu user={u} me={me}
                        onEdit={(x) => setPanel({ type: 'edit', user: x })}
                        onReset={(x) => setPanel({ type: 'reset', user: x })}
                        onToggle={(x) => (isActive(x) ? setConfirm({ type: 'disable', user: x }) : statusMutation.mutate(x))}
                        onDelete={(x) => setConfirm({ type: 'delete', user: x })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isPending && filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-line">
            <p className="text-sm text-ink-soft">
              Showing <span className="font-semibold text-ink">{(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)}</span> of <span className="font-semibold text-ink">{filtered.length}</span>
            </p>
            {totalPages > 1 && (
              <div className="flex gap-1">
                <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-line hover:bg-cream disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <button type="button" onClick={() => setPage(current + 1)} disabled={current === totalPages} aria-label="Next page"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-line hover:bg-cream disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        )}
      </div>

      {panel?.type === 'create' && (
        <Drawer title="Add a user" subtitle="They can sign in with this email and password." onClose={() => setPanel(null)}>
          <UserForm onDone={panelDone} onCancel={() => setPanel(null)} />
        </Drawer>
      )}
      {panel?.type === 'edit' && (
        <Drawer title={panel.user.name} subtitle={panel.user.email} onClose={() => setPanel(null)}>
          <UserForm user={panel.user} onDone={panelDone} onCancel={() => setPanel(null)} />
        </Drawer>
      )}
      {panel?.type === 'reset' && (
        <Drawer title="Reset password" subtitle={`${panel.user.name} · ${panel.user.email}`} onClose={() => setPanel(null)}>
          <ResetPasswordForm user={panel.user} onDone={panelDone} onCancel={() => setPanel(null)} />
        </Drawer>
      )}

      {confirm?.type === 'disable' && (
        <ConfirmDialog title={`Disable ${confirm.user.name}?`} tone="red"
          body="They'll be signed out and won't be able to sign in until you enable the account again. Their orders are kept."
          confirmLabel="Disable account" busy={statusMutation.isPending}
          onCancel={() => setConfirm(null)} onConfirm={() => statusMutation.mutate(confirm.user)} />
      )}
      {confirm?.type === 'delete' && (
        <ConfirmDialog title={`Delete ${confirm.user.name}?`} tone="red"
          body="This permanently removes the account. Their past orders stay in your order history. If you may need the account again, disable it instead."
          confirmLabel="Delete user" busy={deleteMutation.isPending}
          onCancel={() => setConfirm(null)} onConfirm={() => deleteMutation.mutate(confirm.user)} />
      )}
    </div>
  );
}

export default AllUserMain;
