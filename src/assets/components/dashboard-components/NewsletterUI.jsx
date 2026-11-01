import { useEffect } from 'react';
import DOMPurify from 'dompurify';
import { AlertCircle, Check, X } from 'lucide-react';

// Shared pieces for the newsletter screens

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div role="status" className={`fixed top-20 right-4 z-[70] flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-ink text-white' : 'bg-red-600 text-white'}`}>
      {toast.type === 'success' ? <Check className="w-4 h-4 text-gold" /> : <AlertCircle className="w-4 h-4" />}
      {toast.text}
    </div>
  );
}

export function Drawer({ title, subtitle, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-ink/40 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <aside className={`absolute inset-y-0 right-0 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} bg-white shadow-2xl flex flex-col`}>
        <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-line">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-ink truncate">{title}</h2>
            {subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-cream">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="px-6 py-4 border-t border-line flex justify-end gap-3">{footer}</footer>}
      </aside>
    </div>
  );
}

export function ConfirmDialog({ title, body, confirmLabel, tone = 'plum', busy, onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-ink/40 backdrop-blur-sm" aria-label="Cancel" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="font-sans text-lg font-semibold text-ink">{title}</h3>
        <div className="mt-2 text-sm text-ink-soft">{body}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={busy}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${tone === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-plum-600 hover:bg-plum-700'}`}>
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Renders newsletter HTML roughly as subscribers will see it in their inbox
export function EmailPreview({ subject, content }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-3 sm:p-5">
      <div className="mx-auto max-w-[600px] rounded-xl bg-white border border-line overflow-hidden">
        <div className="px-5 py-3 border-b border-line text-xs text-ink-soft space-y-0.5">
          <p><span className="font-semibold text-ink">From:</span> Posh Choice Store</p>
          <p className="truncate"><span className="font-semibold text-ink">Subject:</span> {subject || <em>No subject yet</em>}</p>
        </div>
        <div className="px-5 py-5">
          {content
            ? <div className="rich-text text-[15px]" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
            : <p className="text-sm text-ink-soft italic">Your newsletter content will appear here.</p>}
          <p className="mt-8 pt-4 border-t border-line text-center text-[11px] text-ink-soft">
            You are receiving this because you subscribed to Posh Choice Store updates. <span className="underline">Unsubscribe</span>
          </p>
        </div>
      </div>
    </div>
  );
}

