import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useUser } from '../../context-api/user-context/UseUser';
import { Field, PasswordInput, RolePicker } from './UserAdminUI';
import { MIN_PASSWORD, errorMessage, inputClass, userId, usersApi } from './userAdmin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Switch({ checked, onChange, disabled, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${checked ? 'bg-emerald-600' : 'bg-line'}`}>
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

/**
 * Create or edit a user. In edit mode `user` is the account being edited.
 * Calls onDone(message) after a successful save; shows server errors inline.
 */
export function UserForm({ user, onDone, onCancel, submitLabel }) {
  const { user: me } = useUser();
  const editing = Boolean(user);
  const isSelf = editing && userId(user) === userId(me);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    role: user?.role || 'user',
    isActive: user ? user.isActive !== false : true,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (key, value) => { setForm(f => ({ ...f, [key]: value })); setErrors(e => ({ ...e, [key]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Enter a name.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address.';
    if (!editing && form.password.length < MIN_PASSWORD) e.password = `Use at least ${MIN_PASSWORD} characters.`;
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    setServerError('');
    try {
      if (editing) {
        const body = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() };
        if (!isSelf) Object.assign(body, { role: form.role, isActive: form.isActive });
        await usersApi.update(userId(user), body);
        onDone?.(`${form.name.trim()} was updated.`);
      } else {
        await usersApi.create({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role, isActive: form.isActive });
        onDone?.(`Account created for ${form.name.trim()}.`);
        setForm({ name: '', email: '', phone: '', password: '', role: 'user', isActive: true });
      }
    } catch (err) {
      setServerError(errorMessage(err, editing ? 'Could not update this user.' : 'Could not create this user.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Full name" htmlFor="uf-name" error={errors.name}>
        <input id="uf-name" value={form.name} onChange={e => set('name', e.target.value)} autoComplete="off" className={inputClass} />
      </Field>
      <div className={editing ? 'grid sm:grid-cols-2 gap-4' : ''}>
        <Field label="Email" htmlFor="uf-email" error={errors.email}>
          <input id="uf-email" type="email" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="off" className={inputClass} />
        </Field>
        {editing && (
          <Field label="Phone" htmlFor="uf-phone">
            <input id="uf-phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} />
          </Field>
        )}
      </div>
      {!editing && (
        <PasswordInput id="uf-password" value={form.password} onChange={v => set('password', v)} error={errors.password}
          label="Temporary password" />
      )}

      <div>
        <p className="text-sm font-medium text-ink mb-2">Role</p>
        <RolePicker value={form.role} onChange={v => set('role', v)} disabled={isSelf} />
        {isSelf && <p className="mt-1.5 text-xs text-ink-soft">You can't change your own role.</p>}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
        <div>
          <p className="text-sm font-medium text-ink">Account active</p>
          <p className="text-xs text-ink-soft">{isSelf ? "You can't disable your own account." : 'Disabled accounts cannot sign in.'}</p>
        </div>
        <Switch checked={form.isActive} disabled={isSelf} onChange={() => set('isActive', !form.isActive)} label="Account active" />
      </div>

      {serverError && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{serverError}</p>}

      <div className="flex justify-end gap-3 pt-1">
        {onCancel && <button type="button" onClick={onCancel} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">Cancel</button>}
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-plum-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-60">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel || (editing ? 'Save changes' : 'Create account')}
        </button>
      </div>
    </form>
  );
}

/** Set a new password for another user (admin action). */
export function ResetPasswordForm({ user, onDone, onCancel }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (password.length < MIN_PASSWORD) e.password = `Use at least ${MIN_PASSWORD} characters.`;
    if (confirm !== password) e.confirm = "The passwords don't match.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    setServerError('');
    try {
      await usersApi.resetPassword(userId(user), password);
      setPassword('');
      setConfirm('');
      onDone?.(`Password updated for ${user.name}. Share it with them securely.`);
    } catch (err) {
      setServerError(errorMessage(err, 'Could not reset the password.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <PasswordInput id="rp-password" value={password} onChange={v => { setPassword(v); setConfirm(''); setErrors({}); }}
        onGenerate={v => { setPassword(v); setConfirm(v); setErrors({}); }} error={errors.password} label="New password" />
      <Field label="Confirm new password" htmlFor="rp-confirm" error={errors.confirm}>
        <input id="rp-confirm" type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setErrors(er => ({ ...er, confirm: '' })); }}
          autoComplete="new-password" className={`${inputClass} font-mono tracking-wide`} />
      </Field>
      <p className="rounded-xl bg-gold-soft/60 px-4 py-3 text-xs text-ink">
        The user won't be emailed. Share the new password with them privately and ask them to change it after signing in.
      </p>
      {serverError && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{serverError}</p>}
      <div className="flex justify-end gap-3">
        {onCancel && <button type="button" onClick={onCancel} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">Cancel</button>}
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-plum-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-60">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Set new password
        </button>
      </div>
    </form>
  );
}
