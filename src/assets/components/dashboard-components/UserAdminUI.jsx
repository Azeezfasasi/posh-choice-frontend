import { useState } from 'react';
import { Check, Copy, Eye, EyeOff, Wand2 } from 'lucide-react';
import { useUser } from '../../context-api/user-context/UseUser';
import { MIN_PASSWORD, ROLES, ROLE_STYLE, generatePassword, passwordScore, roleLabel } from './userAdmin';

import { inputClass } from './userAdmin';
const STRENGTH = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'];

export function RoleBadge({ role }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${ROLE_STYLE[role] || 'bg-cream text-ink ring-line'}`}>
      {roleLabel(role)}
    </span>
  );
}

export function Avatar({ name, size = 'w-10 h-10', text = 'text-sm' }) {
  // Letters only, so "Customer 13" becomes "C" rather than "C1"
  const initials = (name || '?').trim().split(/\s+/).filter(p => /^\p{L}/u.test(p)).slice(0, 2).map(p => p[0].toUpperCase()).join('');
  return (
    <span className={`shrink-0 inline-flex items-center justify-center ${size} ${text} rounded-full bg-plum-50 text-plum-700 font-semibold`} aria-hidden="true">
      {initials || '?'}
    </span>
  );
}

export function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

// Password input with show/hide, generator, copy and strength meter
export function PasswordInput({ id, value, onChange, onGenerate, error, label = 'Password', autoComplete = 'new-password' }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const score = value ? passwordScore(value) : 0;

  const generate = () => {
    const pw = generatePassword();
    if (onGenerate) onGenerate(pw);
    else onChange(pw);
    setVisible(true);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label>
        <button type="button" onClick={generate} className="inline-flex items-center gap-1 text-xs font-semibold text-plum-700 hover:text-plum-800">
          <Wand2 className="w-3.5 h-3.5" /> Generate
        </button>
      </div>
      <div className="relative">
        <input id={id} type={visible ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete}
          className={`${inputClass} pr-20 font-mono tracking-wide`} aria-invalid={Boolean(error)} />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex">
          {value && (
            <button type="button" onClick={copy} aria-label="Copy password" title="Copy"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-ink-soft hover:bg-cream hover:text-ink">
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
          <button type="button" onClick={() => setVisible(v => !v)} aria-label={visible ? 'Hide password' : 'Show password'}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-ink-soft hover:bg-cream hover:text-ink">
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {value && (
        <div className="mt-2 flex items-center gap-2" aria-live="polite">
          <div className="flex-1 grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map(i => <span key={i} className={`h-1.5 rounded-full ${score >= i ? STRENGTH_COLOR[score] : 'bg-line'}`} />)}
          </div>
          <span className="text-xs font-medium text-ink-soft w-16 text-right">{STRENGTH[score]}</span>
        </div>
      )}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : <p className="mt-1.5 text-xs text-ink-soft">At least {MIN_PASSWORD} characters.</p>}
    </div>
  );
}

// Role picker that only offers roles the signed-in admin may assign
export function RolePicker({ value, onChange, disabled }) {
  const { isSuperAdmin } = useUser();
  const options = ROLES.filter(r => isSuperAdmin || r.value === 'user' || r.value === 'customer' || r.value === value);
  return (
    <div className="grid sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Role">
      {options.map(r => {
        const locked = disabled || (!isSuperAdmin && ['admin', 'super admin'].includes(r.value));
        return (
          <label key={r.value} className={`flex items-start gap-2.5 rounded-xl border-2 p-3 transition ${
            value === r.value ? 'border-plum-600 bg-plum-50/50' : 'border-line'} ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-plum-200'}`}>
            <input type="radio" name="role" value={r.value} checked={value === r.value} disabled={locked}
              onChange={() => onChange(r.value)} className="mt-0.5 accent-[#5b2a86]" />
            <span>
              <span className="block text-sm font-semibold text-ink">{r.label}</span>
              <span className="block text-xs text-ink-soft">{r.hint}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}


