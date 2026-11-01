import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Eye, FlaskConical, Loader2, PenLine, Save, Send, Users } from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';
import { useUser } from '../../context-api/user-context/UseUser';
import RichTextEditor from '../RichTextEditor';
import { ConfirmDialog, EmailPreview, Toast } from './NewsletterUI';
import { plainText } from './newsletterText';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const parseEmails = (text) => [...new Set(text.split(/[\s,;]+/).map(e => e.trim().toLowerCase()).filter(Boolean))];

function SendNewsletterMain() {
  const { user } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft');

  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('all'); // all | custom
  const [customEmails, setCustomEmails] = useState('');
  const [tab, setTab] = useState('write'); // write | preview
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState(null);
  const [fieldError, setFieldError] = useState('');

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const { data: subscribers = [] } = useQuery({
    queryKey: ['subscribers'],
    queryFn: async () => (await axios.get(`${API_BASE_URL}/newsletter/subscribers`)).data,
  });
  const activeCount = subscribers.filter(s => s.isActive !== false).length;

  // Load a draft when opened from the Newsletters page (?draft=id)
  const { data: newsletters } = useQuery({
    queryKey: ['newsletters'],
    queryFn: async () => (await axios.get(`${API_BASE_URL}/newsletter/all`)).data,
    enabled: Boolean(draftId),
  });
  useEffect(() => {
    const draft = draftId && newsletters?.find(n => n._id === draftId);
    if (draft) {
      setSubject(draft.subject || '');
      setContent(draft.content || '');
      if (draft.recipients?.length) {
        setAudience('custom');
        setCustomEmails(draft.recipients.join(', '));
      }
    }
  }, [draftId, newsletters]);

  // Clear the validation message as soon as the form is edited
  useEffect(() => { setFieldError(''); }, [subject, content, audience, customEmails]);

  const emails = useMemo(() => parseEmails(customEmails), [customEmails]);
  const invalidEmails = emails.filter(e => !EMAIL_RE.test(e));
  const recipientCount = audience === 'all' ? activeCount : emails.length;

  const validate = () => {
    if (!subject.trim()) return 'Add a subject line.';
    if (!plainText(content)) return 'Write some content for your newsletter.';
    if (audience === 'custom' && emails.length === 0) return 'Add at least one recipient email.';
    if (audience === 'custom' && invalidEmails.length) return `Check these emails: ${invalidEmails.join(', ')}`;
    return '';
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['newsletters'] });
    queryClient.invalidateQueries({ queryKey: ['subscribers'] });
  };

  const sendMutation = useMutation({
    mutationFn: async ({ recipients }) => {
      const res = await axios.post(`${API_BASE_URL}/newsletter/send`, { subject: subject.trim(), content, recipients });
      return res.data;
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const body = { subject: subject.trim(), content, recipients: audience === 'custom' ? emails : [] };
      return draftId
        ? (await axios.put(`${API_BASE_URL}/newsletter/${draftId}`, body)).data
        : (await axios.post(`${API_BASE_URL}/newsletter/draft`, body)).data;
    },
    onSuccess: (saved) => {
      refresh();
      showToast('success', 'Draft saved.');
      if (!draftId && saved?._id) navigate(`/app/sendnewsletter?draft=${saved._id}`, { replace: true });
    },
    onError: (err) => showToast('error', err.response?.data?.error || 'Could not save the draft.'),
  });

  const sendNow = async () => {
    try {
      const result = await sendMutation.mutateAsync({ recipients: audience === 'custom' ? emails : undefined });
      // A sent draft is no longer needed
      if (draftId) await axios.delete(`${API_BASE_URL}/newsletter/${draftId}`).catch(() => {});
      refresh();
      setConfirming(false);
      showToast('success', result?.message || 'Newsletter sent!');
      setSubject(''); setContent(''); setCustomEmails(''); setAudience('all');
      if (draftId) navigate('/app/sendnewsletter', { replace: true });
    } catch (err) {
      setConfirming(false);
      showToast('error', err.response?.data?.error || 'Failed to send newsletter.');
    }
  };

  const sendTest = async () => {
    const problem = !subject.trim() ? 'Add a subject line.' : !plainText(content) ? 'Write some content first.' : '';
    if (problem) return setFieldError(problem);
    if (!user?.email) return showToast('error', 'Your account has no email address.');
    setFieldError('');
    try {
      await sendMutation.mutateAsync({ recipients: [user.email] });
      refresh();
      showToast('success', `Test sent to ${user.email}.`);
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to send test.');
    }
  };

  const requestSend = (e) => {
    e.preventDefault();
    const problem = validate();
    setFieldError(problem);
    if (!problem) setConfirming(true);
  };

  const busy = sendMutation.isPending || saveDraftMutation.isPending;

  return (
    <form onSubmit={requestSend} className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
      <Toast toast={toast} />

      {/* Compose */}
      <div className="min-w-0 rounded-2xl border border-line bg-white">
        <div className="px-5 md:px-6 pt-5 flex items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-cream p-1" role="tablist" aria-label="Editor mode">
            {[['write', 'Write', PenLine], ['preview', 'Preview', Eye]].map(([value, label, icon]) => (
              <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition ${tab === value ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}>
                {React.createElement(icon, { className: 'w-4 h-4' })} {label}
              </button>
            ))}
          </div>
          {draftId && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">Editing draft</span>}
        </div>

        <div className="p-5 md:p-6 space-y-5">
          <div>
            <label htmlFor="nl-subject" className="block text-sm font-medium text-ink mb-1.5">Subject line</label>
            <input id="nl-subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} maxLength={150}
              placeholder="e.g. Our December sale starts today 🎁" className="w-full h-12 px-4 rounded-xl border border-line bg-white text-ink text-[15px]" />
            <p className="mt-1.5 text-xs text-ink-soft">{subject.length}/150 · Short, specific subjects get opened more.</p>
          </div>

          {tab === 'write' ? (
            <div>
              <p className="block text-sm font-medium text-ink mb-1.5">Message</p>
              <RichTextEditor value={content} onChange={setContent} placeholder="Write your newsletter…" minHeight={380} />
            </div>
          ) : (
            <EmailPreview subject={subject} content={content} />
          )}
        </div>
      </div>

      {/* Settings & actions */}
      <div className="space-y-6 xl:sticky xl:top-24 min-w-0">
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-ink-soft mb-3">Recipients</h2>
          <div className="space-y-2" role="radiogroup" aria-label="Recipients">
            {[
              ['all', 'All active subscribers', `${activeCount} subscriber${activeCount === 1 ? '' : 's'}`],
              ['custom', 'Specific people', 'Enter email addresses'],
            ].map(([value, label, hint]) => (
              <label key={value} className={`flex items-start gap-3 rounded-xl border-2 p-3 cursor-pointer transition ${audience === value ? 'border-plum-600 bg-plum-50/50' : 'border-line hover:border-plum-200'}`}>
                <input type="radio" name="audience" value={value} checked={audience === value} onChange={() => setAudience(value)} className="mt-1 accent-[#5b2a86]" />
                <span>
                  <span className="block text-sm font-semibold text-ink">{label}</span>
                  <span className="block text-xs text-ink-soft">{hint}</span>
                </span>
              </label>
            ))}
          </div>
          {audience === 'custom' && (
            <div className="mt-3">
              <label htmlFor="nl-emails" className="sr-only">Recipient emails</label>
              <textarea id="nl-emails" rows="3" value={customEmails} onChange={e => setCustomEmails(e.target.value)}
                placeholder="name@example.com, another@example.com" className="w-full px-3 py-2.5 rounded-xl border border-line text-sm" />
              <p className={`mt-1 text-xs ${invalidEmails.length ? 'text-red-600' : 'text-ink-soft'}`}>
                {invalidEmails.length ? `Invalid: ${invalidEmails.join(', ')}` : `${emails.length} recipient${emails.length === 1 ? '' : 's'} · separate with commas or new lines`}
              </p>
            </div>
          )}
          <p className="mt-3 text-xs text-ink-soft flex items-start gap-1.5">
            <Users className="w-3.5 h-3.5 mt-px shrink-0" /> Each subscriber gets their own email with an unsubscribe link.
          </p>
        </section>

        {fieldError && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{fieldError}</p>}

        <div className="space-y-3">
          <button type="submit" disabled={busy || recipientCount === 0}
            className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-plum-600 text-white font-semibold hover:bg-plum-700 transition disabled:opacity-60">
            {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {recipientCount ? `Send to ${recipientCount} ${recipientCount === 1 ? 'person' : 'people'}` : 'No recipients yet'}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => saveDraftMutation.mutate()} disabled={busy || !subject.trim()}
              className="h-11 inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white text-sm font-semibold text-ink hover:bg-cream disabled:opacity-50">
              <Save className="w-4 h-4" /> Save draft
            </button>
            <button type="button" onClick={sendTest} disabled={busy} title={user?.email ? `Send a test to ${user.email}` : undefined}
              className="h-11 inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white text-sm font-semibold text-ink hover:bg-cream disabled:opacity-50">
              <FlaskConical className="w-4 h-4" /> Send test
            </button>
          </div>
          <p className="text-xs text-ink-soft text-center">Tests go to {user?.email || 'your email'} and appear in your newsletter history.</p>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title={`Send "${subject.trim()}"?`}
          body={<>This will email <span className="font-semibold text-ink">{recipientCount} {recipientCount === 1 ? 'person' : 'people'}</span> right away. Sent newsletters can't be recalled.</>}
          confirmLabel="Send now"
          busy={sendMutation.isPending}
          onCancel={() => setConfirming(false)}
          onConfirm={sendNow}
        />
      )}
    </form>
  );
}

export default SendNewsletterMain;
