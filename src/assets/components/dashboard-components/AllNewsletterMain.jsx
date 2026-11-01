import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Eye, Mail, PenLine, Search, Send, Trash2, Users } from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';
import { ConfirmDialog, Drawer, EmailPreview, Toast } from './NewsletterUI';
import { plainText } from './newsletterText';

const PAGE_SIZE = 10;
const when = (d) => (d ? new Date(d).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

function AllNewsletterMain() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all'); // all | sent | draft
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const { data = [], isPending, isError, refetch } = useQuery({
    queryKey: ['newsletters'],
    queryFn: async () => (await axios.get(`${API_BASE_URL}/newsletter/all`)).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => axios.delete(`${API_BASE_URL}/newsletter/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      setToDelete(null);
      setPreview(null);
      showToast('success', 'Newsletter deleted.');
    },
    onError: (err) => showToast('error', err.response?.data?.error || 'Failed to delete newsletter.'),
  });

  const counts = useMemo(() => ({
    all: data.length,
    sent: data.filter(n => n.status === 'sent').length,
    draft: data.filter(n => n.status === 'draft').length,
  }), [data]);

  const totalReach = data.filter(n => n.status === 'sent').reduce((s, n) => s + (n.recipients?.length || 0), 0);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data
      .filter(n => tab === 'all' || n.status === tab)
      .filter(n => !term || n.subject?.toLowerCase().includes(term) || plainText(n.content).toLowerCase().includes(term));
  }, [data, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const changeTab = (value) => { setTab(value); setPage(1); };

  return (
    <div className="space-y-5">
      <Toast toast={toast} />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[['Sent', counts.sent, Send], ['Drafts', counts.draft, PenLine], ['Emails delivered', totalReach, Users]].map(([label, value, icon]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs md:text-sm text-ink-soft">{label}</p>
              <p className="mt-1 text-xl md:text-2xl font-bold text-ink tabular-nums">{isPending ? '…' : value}</p>
            </div>
            <span className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-xl bg-plum-50 text-plum-600">{React.createElement(icon, { className: 'w-5 h-5' })}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex gap-2" role="tablist" aria-label="Filter newsletters">
          {[['all', 'All'], ['sent', 'Sent'], ['draft', 'Drafts']].map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => changeTab(value)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${tab === value ? 'border-plum-600 bg-plum-600 text-white' : 'border-line bg-white text-ink hover:border-plum-300'}`}>
              {label}
              <span className={`rounded-full px-1.5 text-xs font-semibold ${tab === value ? 'bg-white/20' : 'bg-cream text-ink-soft'}`}>{counts[value]}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3 md:ml-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
            <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search newsletters"
              aria-label="Search newsletters" className="w-full h-10 pl-10 pr-3 rounded-full border border-line bg-white text-sm" />
          </div>
          <Link to="/app/sendnewsletter" className="shrink-0 inline-flex items-center gap-2 h-10 rounded-full bg-plum-600 px-5 text-sm font-semibold text-white hover:bg-plum-700">
            <Mail className="w-4 h-4" /> <span className="hidden sm:inline">New newsletter</span><span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>

      {/* List */}
      {isPending ? (
        <div className="space-y-3" aria-busy="true">{[0, 1, 2].map(i => <div key={i} className="h-24 rounded-2xl bg-white border border-line animate-pulse" />)}</div>
      ) : isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          We couldn't load newsletters. <button type="button" onClick={() => refetch()} className="font-semibold underline">Try again</button>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white py-14 text-center">
          <Mail className="w-8 h-8 text-ink-soft/60 mx-auto" />
          <p className="mt-3 font-semibold text-ink">{search ? 'No newsletters match your search' : tab === 'draft' ? 'No drafts' : 'No newsletters yet'}</p>
          <Link to="/app/sendnewsletter" className="mt-4 inline-flex rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700">Write a newsletter</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map(n => {
            const draft = n.status === 'draft';
            const reach = n.recipients?.length || 0;
            return (
              <li key={n._id} className="rounded-2xl border border-line bg-white p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                <button type="button" onClick={() => setPreview(n)} className="flex-1 min-w-0 text-left group">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${draft ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-emerald-50 text-emerald-800 ring-emerald-200'}`}>
                      {draft ? 'Draft' : 'Sent'}
                    </span>
                    <span className="text-xs text-ink-soft">{draft ? `Last edited ${when(n.updatedAt || n.createdAt)}` : `Sent ${when(n.sentAt)}`}</span>
                  </div>
                  <h3 className="mt-1.5 font-sans text-base font-semibold text-ink group-hover:text-plum-700 truncate">{n.subject}</h3>
                  <p className="mt-0.5 text-sm text-ink-soft line-clamp-1">{plainText(n.content) || 'No content'}</p>
                </button>
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                  <p className="text-sm text-ink-soft flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {draft ? (reach ? `${reach} selected` : 'All subscribers') : `${reach} recipient${reach === 1 ? '' : 's'}`}
                  </p>
                  <div className="flex gap-1">
                    {draft ? (
                      <button type="button" onClick={() => navigate(`/app/sendnewsletter?draft=${n._id}`)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-plum-600 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-700">
                        <PenLine className="w-4 h-4" /> Continue
                      </button>
                    ) : (
                      <button type="button" onClick={() => setPreview(n)} aria-label={`Preview ${n.subject}`} title="Preview"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full text-ink hover:bg-plum-50 hover:text-plum-700">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button type="button" onClick={() => setToDelete(n)} aria-label={`Delete ${n.subject}`} title="Delete"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full text-ink-soft hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
          <p className="text-sm text-ink-soft">Page {current} of {totalPages}</p>
          <div className="flex gap-1">
            <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-line bg-white hover:bg-cream disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            <button type="button" onClick={() => setPage(current + 1)} disabled={current === totalPages} aria-label="Next page"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-line bg-white hover:bg-cream disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </nav>
      )}

      {preview && (
        <Drawer wide title={preview.subject} subtitle={preview.status === 'draft' ? 'Draft' : `Sent ${when(preview.sentAt)}`} onClose={() => setPreview(null)}
          footer={preview.status === 'draft' ? (
            <button type="button" onClick={() => navigate(`/app/sendnewsletter?draft=${preview._id}`)} className="rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700">Continue editing</button>
          ) : (
            <button type="button" onClick={() => setPreview(null)} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">Close</button>
          )}>
          <EmailPreview subject={preview.subject} content={preview.content} />
          {preview.recipients?.length > 0 && (
            <details className="mt-5">
              <summary className="cursor-pointer text-sm font-semibold text-ink">{preview.recipients.length} recipient{preview.recipients.length === 1 ? '' : 's'}</summary>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {preview.recipients.map(r => <li key={r} className="rounded-full bg-cream px-2.5 py-1 text-xs text-ink">{r}</li>)}
              </ul>
            </details>
          )}
        </Drawer>
      )}

      {toDelete && (
        <ConfirmDialog tone="red" title={`Delete "${toDelete.subject}"?`}
          body={toDelete.status === 'sent' ? 'This only removes it from your history. Emails already sent are not affected.' : 'This draft will be permanently deleted.'}
          confirmLabel="Delete" busy={deleteMutation.isPending}
          onCancel={() => setToDelete(null)} onConfirm={() => deleteMutation.mutate(toDelete._id)} />
      )}
    </div>
  );
}

export default AllNewsletterMain;
