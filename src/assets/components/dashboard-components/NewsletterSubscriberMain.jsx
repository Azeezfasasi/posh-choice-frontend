import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Download, Pencil, Search, Trash2, UserCheck, UserMinus, Users } from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';
import { ConfirmDialog, Drawer, Toast } from './NewsletterUI';

const PAGE_SIZE = 20;
const shortDate = (d) => (d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const isActive = (s) => s.isActive !== false;

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function downloadCsv(subscribers) {
  const header = ['Email', 'Name', 'Status', 'Subscribed', 'Unsubscribed', 'Last newsletter', 'Tags', 'Notes'];
  const lines = subscribers.map(s => [
    s.email, s.name, isActive(s) ? 'Active' : 'Unsubscribed', shortDate(s.subscribedAt),
    s.unsubscribedAt ? shortDate(s.unsubscribedAt) : '', s.lastNewsletterSentAt ? shortDate(s.lastNewsletterSentAt) : '',
    (s.tags || []).join('; '), s.notes,
  ].map(csvCell).join(','));
  const blob = new Blob([[header.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `posh-choice-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SubscriberForm({ subscriber, onCancel, onSave, saving }) {
  const [name, setName] = useState(subscriber.name || '');
  const [tags, setTags] = useState((subscriber.tags || []).join(', '));
  const [notes, setNotes] = useState(subscriber.notes || '');
  const [active, setActive] = useState(isActive(subscriber));

  const save = () => onSave({
    name: name.trim(),
    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    notes: notes.trim(),
    isActive: active,
  });

  const input = 'w-full h-11 px-3.5 rounded-xl border border-line bg-white text-sm text-ink';

  return (
    <Drawer title={subscriber.email} subtitle={`Subscribed ${shortDate(subscriber.subscribedAt)}`} onClose={onCancel}
      footer={<>
        <button type="button" onClick={onCancel} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">Cancel</button>
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>
      </>}>
      <div className="space-y-5">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-cream p-3"><dt className="text-xs text-ink-soft">Last newsletter</dt><dd className="font-semibold text-ink">{shortDate(subscriber.lastNewsletterSentAt)}</dd></div>
          <div className="rounded-xl bg-cream p-3"><dt className="text-xs text-ink-soft">{isActive(subscriber) ? 'Status' : 'Unsubscribed'}</dt><dd className="font-semibold text-ink">{isActive(subscriber) ? 'Active' : shortDate(subscriber.unsubscribedAt)}</dd></div>
        </dl>
        <div>
          <label htmlFor="sub-name" className="block text-sm font-medium text-ink mb-1.5">Name</label>
          <input id="sub-name" value={name} onChange={e => setName(e.target.value)} placeholder="Optional" className={input} />
        </div>
        <div>
          <label htmlFor="sub-tags" className="block text-sm font-medium text-ink mb-1.5">Tags</label>
          <input id="sub-tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. wholesale, vip" className={input} />
          <p className="mt-1.5 text-xs text-ink-soft">Separate with commas. Useful for grouping customers.</p>
        </div>
        <div>
          <label htmlFor="sub-notes" className="block text-sm font-medium text-ink mb-1.5">Notes</label>
          <textarea id="sub-notes" rows="4" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes, only admins see these"
            className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-white text-sm text-ink" />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">Receives newsletters</p>
            <p className="text-xs text-ink-soft">Only turn this on if the person asked to be subscribed again.</p>
          </div>
          <button type="button" role="switch" aria-checked={active} aria-label="Receives newsletters" onClick={() => setActive(a => !a)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${active ? 'bg-emerald-600' : 'bg-line'}`}>
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </Drawer>
  );
}

function NewsletterSubscriberMain() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('active'); // all | active | unsubscribed
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [toRemove, setToRemove] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const { data = [], isPending, isError, refetch } = useQuery({
    queryKey: ['subscribers'],
    queryFn: async () => (await axios.get(`${API_BASE_URL}/newsletter/subscribers`)).data,
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, ...body }) => (await axios.put(`${API_BASE_URL}/newsletter/subscribers/${id}`, body)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      setEditing(null);
      showToast('success', 'Subscriber updated.');
    },
    onError: (err) => showToast('error', err.response?.data?.error || 'Failed to update subscriber.'),
  });

  const removeMutation = useMutation({
    mutationFn: async (id) => axios.delete(`${API_BASE_URL}/newsletter/subscribers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      setToRemove(null);
      showToast('success', 'Subscriber removed.');
    },
    onError: (err) => showToast('error', err.response?.data?.error || 'Failed to remove subscriber.'),
  });

  const sorted = useMemo(() => [...data].sort((a, b) => new Date(b.subscribedAt || 0) - new Date(a.subscribedAt || 0)), [data]);
  const activeCount = data.filter(isActive).length;
  const thisMonth = data.filter(s => {
    const d = new Date(s.subscribedAt); const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sorted
      .filter(s => tab === 'all' || (tab === 'active' ? isActive(s) : !isActive(s)))
      .filter(s => !term || [s.email, s.name, ...(s.tags || [])].some(v => v && v.toLowerCase().includes(term)));
  }, [sorted, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <Toast toast={toast} />

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[['Active subscribers', activeCount, UserCheck], ['New this month', thisMonth, Users], ['Unsubscribed', data.length - activeCount, UserMinus]].map(([label, value, icon]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs md:text-sm text-ink-soft">{label}</p>
              <p className="mt-1 text-xl md:text-2xl font-bold text-ink tabular-nums">{isPending ? '…' : value}</p>
            </div>
            <span className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-xl bg-plum-50 text-plum-600">{React.createElement(icon, { className: 'w-5 h-5' })}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Filter subscribers">
          {[['active', 'Active', activeCount], ['unsubscribed', 'Unsubscribed', data.length - activeCount], ['all', 'All', data.length]].map(([value, label, count]) => (
            <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => { setTab(value); setPage(1); }}
              className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${tab === value ? 'border-plum-600 bg-plum-600 text-white' : 'border-line bg-white text-ink hover:border-plum-300'}`}>
              {label}
              <span className={`rounded-full px-1.5 text-xs font-semibold ${tab === value ? 'bg-white/20' : 'bg-cream text-ink-soft'}`}>{count}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3 md:ml-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
            <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search email, name or tag"
              aria-label="Search subscribers" className="w-full h-10 pl-10 pr-3 rounded-full border border-line bg-white text-sm" />
          </div>
          <button type="button" onClick={() => downloadCsv(filtered)} disabled={!filtered.length}
            className="shrink-0 inline-flex items-center gap-2 h-10 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-cream disabled:opacity-50">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white">
        {isPending ? (
          <div className="p-4 space-y-2" aria-busy="true">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-cream animate-pulse" />)}</div>
        ) : isError ? (
          <p role="alert" className="p-6 text-center text-sm text-red-700">We couldn't load subscribers. <button type="button" onClick={() => refetch()} className="font-semibold underline">Try again</button></p>
        ) : rows.length === 0 ? (
          <p className="py-14 text-center text-ink-soft">{search ? 'No subscribers match your search.' : 'No subscribers here yet.'}</p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider border-b border-line">
                  <th className="px-4 py-3 font-semibold">Subscriber</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Subscribed</th>
                  <th className="px-4 py-3 font-semibold">Tags</th>
                  <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(s => (
                  <tr key={s._id} className="hover:bg-cream/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-plum-50 text-plum-700 text-sm font-semibold">
                          {(s.name || s.email || '?').charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-ink truncate max-w-[16rem]">{s.email}</p>
                          {s.name && <p className="text-xs text-ink-soft">{s.name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${isActive(s) ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                        {isActive(s) ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{shortDate(s.subscribedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(s.tags || []).length ? s.tags.map(t => <span key={t} className="rounded-full bg-plum-50 px-2 py-0.5 text-xs text-plum-700">{t}</span>) : <span className="text-ink-soft/60">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setEditing(s)} aria-label={`Edit ${s.email}`} title="Edit"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full text-ink hover:bg-plum-50 hover:text-plum-700"><Pencil className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setToRemove(s)} aria-label={`Remove ${s.email}`} title="Remove"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full text-ink-soft hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
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

      {editing && (
        <SubscriberForm subscriber={editing} saving={editMutation.isPending} onCancel={() => setEditing(null)}
          onSave={(body) => editMutation.mutate({ id: editing._id, ...body })} />
      )}

      {toRemove && (
        <ConfirmDialog tone="red" title={`Remove ${toRemove.email}?`}
          body="This deletes the subscriber completely. If they just want to stop receiving emails, edit them and turn off “Receives newsletters” instead, which keeps a record that they unsubscribed."
          confirmLabel="Remove" busy={removeMutation.isPending}
          onCancel={() => setToRemove(null)} onConfirm={() => removeMutation.mutate(toRemove._id)} />
      )}
    </div>
  );
}

export default NewsletterSubscriberMain;
