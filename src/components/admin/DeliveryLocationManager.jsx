import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, MapPin, Pencil, Plus, Search, Trash2, Truck, X } from 'lucide-react';
import { useUser } from '../../assets/context-api/user-context/UseUser';
import { formatNaira } from '../../utils/formatPrice';
import {
  fetchAllDeliveryLocations,
  createDeliveryLocation,
  updateDeliveryLocation,
  deleteDeliveryLocation,
  bulkUpdateDeliveryLocationStatus,
} from '../../services/deliveryLocationApi';

const EMPTY_FORM = { name: '', description: '', shippingAmount: '', isActive: true, sortOrder: 0 };

// A location's name is a comma-separated list of areas ("Ikeja, Ogba, Agege")
const areasOf = (name = '') => name.split(',').map(a => a.trim()).filter(Boolean);

const inputClass = 'w-full h-11 px-3.5 rounded-xl border border-line bg-white text-ink text-sm placeholder:text-ink-soft/70';

function Switch({ checked, onChange, label, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${checked ? 'bg-emerald-600' : 'bg-line'}`}>
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function LocationForm({ initial, editing, onCancel, onSave, saving }) {
  const [form, setForm] = useState(initial);
  const [formError, setFormError] = useState('');
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const submit = (e) => {
    e.preventDefault();
    const amount = Number(form.shippingAmount);
    if (!form.name.trim()) return setFormError('Add at least one area.');
    if (form.shippingAmount === '' || Number.isNaN(amount) || amount < 0) return setFormError('Enter a delivery fee of ₦0 or more.');
    setFormError('');
    onSave({ ...form, name: areasOf(form.name).join(', '), shippingAmount: amount, sortOrder: Number(form.sortOrder) || 0 });
  };

  const areas = areasOf(form.name);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="zone-form-title">
      <button type="button" className="absolute inset-0 bg-ink/40 backdrop-blur-sm" aria-label="Close" onClick={onCancel} />
      <form onSubmit={submit} className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        <header className="flex items-center justify-between px-6 py-5 border-b border-line">
          <h2 id="zone-form-title" className="font-display text-xl font-semibold text-ink">{editing ? 'Edit delivery zone' : 'New delivery zone'}</h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-cream"><X className="w-5 h-5" /></button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label htmlFor="zone-areas" className="block text-sm font-medium text-ink mb-1.5">Areas</label>
            <textarea id="zone-areas" rows="3" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Lekki Phase 1, Ajah, Victoria Island" className={`${inputClass} h-auto py-2.5`} />
            <p className="mt-1.5 text-xs text-ink-soft">Separate areas with commas. Customers see this list at checkout.</p>
            {areas.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {areas.map((a, i) => <span key={`${a}-${i}`} className="rounded-full bg-plum-50 px-2.5 py-1 text-xs font-medium text-plum-700">{a}</span>)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="zone-fee" className="block text-sm font-medium text-ink mb-1.5">Delivery fee (₦)</label>
              <input id="zone-fee" type="number" min="0" step="100" inputMode="numeric" value={form.shippingAmount}
                onChange={e => set('shippingAmount', e.target.value)} placeholder="e.g. 3000" className={inputClass} />
            </div>
            <div>
              <label htmlFor="zone-order" className="block text-sm font-medium text-ink mb-1.5">Display order</label>
              <input id="zone-order" type="number" min="0" value={form.sortOrder} onChange={e => set('sortOrder', e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="zone-desc" className="block text-sm font-medium text-ink mb-1.5">
              Note <span className="font-normal text-ink-soft">(optional, admin only)</span>
            </label>
            <input id="zone-desc" type="text" value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="e.g. Delivered by Dispatch Rider B" className={inputClass} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Available at checkout</p>
              <p className="text-xs text-ink-soft">Turn off to hide this zone from customers.</p>
            </div>
            <Switch checked={form.isActive} onChange={() => set('isActive', !form.isActive)} label="Available at checkout" />
          </div>

          {formError && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{formError}</p>}
        </div>

        <footer className="px-6 py-4 border-t border-line flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-60">
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create zone'}
          </button>
        </footer>
      </form>
    </div>
  );
}

const DeliveryLocationManager = () => {
  const { token } = useUser();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [formState, setFormState] = useState(null); // { id?, initial }
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState('');

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      setLocations(await fetchAllDeliveryLocations(token));
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadLocations(); }, [loadLocations]);

  const save = async (data) => {
    setSaving(true);
    try {
      if (formState.id) await updateDeliveryLocation(formState.id, data, token);
      else await createDeliveryLocation(data, token);
      showToast('success', formState.id ? 'Delivery zone updated.' : 'Delivery zone created.');
      setFormState(null);
      loadLocations();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (location) => {
    if (!window.confirm(`Delete this delivery zone (${formatNaira(location.shippingAmount)})? Customers will no longer be able to choose it.`)) return;
    setBusyId(location._id);
    try {
      await deleteDeliveryLocation(location._id, token);
      showToast('success', 'Delivery zone deleted.');
      loadLocations();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const toggle = async (location) => {
    setBusyId(location._id);
    try {
      await bulkUpdateDeliveryLocationStatus([location._id], !location.isActive, token);
      setLocations(ls => ls.map(l => (l._id === location._id ? { ...l, isActive: !l.isActive } : l)));
      showToast('success', location.isActive ? 'Zone hidden from checkout.' : 'Zone available at checkout.');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const sorted = useMemo(
    () => [...locations].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.shippingAmount - b.shippingAmount),
    [locations]
  );
  const term = search.trim().toLowerCase();
  const visible = term ? sorted.filter(l => l.name.toLowerCase().includes(term) || (l.description || '').toLowerCase().includes(term)) : sorted;

  const active = locations.filter(l => l.isActive);
  const fees = active.map(l => l.shippingAmount);

  return (
    <div className="space-y-5">
      {toast && (
        <div role="status" className={`fixed top-20 right-4 z-[60] flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-ink text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <Check className="w-4 h-4 text-gold" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[
          ['Active zones', loading ? '…' : `${active.length}${locations.length > active.length ? ` of ${locations.length}` : ''}`],
          ['Lowest fee', loading || !fees.length ? '—' : formatNaira(Math.min(...fees))],
          ['Highest fee', loading || !fees.length ? '—' : formatNaira(Math.max(...fees))],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-xs md:text-sm text-ink-soft">{label}</p>
            <p className="mt-1 text-lg md:text-2xl font-bold text-ink tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find an area, e.g. Ikeja"
            aria-label="Search areas" className="w-full h-10 pl-10 pr-3 rounded-full border border-line bg-white text-sm" />
        </div>
        <button type="button" onClick={() => setFormState({ initial: { ...EMPTY_FORM, sortOrder: locations.length } })}
          className="shrink-0 inline-flex items-center gap-2 h-10 rounded-full bg-plum-600 px-5 text-sm font-semibold text-white hover:bg-plum-700">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New zone</span><span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Zones */}
      {loading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map(i => <div key={i} className="h-32 rounded-2xl bg-white border border-line animate-pulse" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white py-14 text-center">
          <Truck className="w-8 h-8 text-ink-soft/60 mx-auto" />
          <p className="mt-3 font-semibold text-ink">{term ? `No zone covers "${search.trim()}"` : 'No delivery zones yet'}</p>
          <p className="mt-1 text-sm text-ink-soft">{term ? 'Add it to an existing zone or create a new one.' : 'Customers need at least one zone to check out.'}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((loc, index) => {
            const areas = areasOf(loc.name);
            return (
              <li key={loc._id} className={`rounded-2xl border bg-white p-4 md:p-5 transition ${loc.isActive ? 'border-line' : 'border-dashed border-line opacity-70'}`}>
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="md:w-40 shrink-0 flex md:flex-col items-baseline md:items-start justify-between gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Zone {term ? sorted.indexOf(loc) + 1 : index + 1}</p>
                    <p className="text-2xl font-bold text-ink tabular-nums">{formatNaira(loc.shippingAmount)}</p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-ink-soft mb-2">
                      <MapPin className="w-3.5 h-3.5" /> {areas.length} area{areas.length === 1 ? '' : 's'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {areas.map((a, i) => (
                        <span key={`${a}-${i}`}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${term && a.toLowerCase().includes(term) ? 'bg-gold-soft text-ink ring-1 ring-gold' : 'bg-cream text-ink'}`}>
                          {a}
                        </span>
                      ))}
                    </div>
                    {loc.description && <p className="mt-2 text-sm text-ink-soft">{loc.description}</p>}
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                    <label className="flex items-center gap-2 text-sm text-ink-soft">
                      <span className={loc.isActive ? 'text-emerald-700 font-medium' : ''}>{loc.isActive ? 'Live' : 'Hidden'}</span>
                      <Switch checked={loc.isActive} disabled={busyId === loc._id} onChange={() => toggle(loc)}
                        label={`${loc.isActive ? 'Hide' : 'Show'} zone ${formatNaira(loc.shippingAmount)} at checkout`} />
                    </label>
                    <div className="flex gap-1">
                      <button type="button" aria-label="Edit zone" title="Edit"
                        onClick={() => setFormState({ id: loc._id, initial: { name: loc.name, description: loc.description || '', shippingAmount: loc.shippingAmount, isActive: loc.isActive, sortOrder: loc.sortOrder || 0 } })}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full text-ink hover:bg-plum-50 hover:text-plum-700">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" aria-label="Delete zone" title="Delete" disabled={busyId === loc._id} onClick={() => remove(loc)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full text-ink-soft hover:bg-red-50 hover:text-red-600 disabled:opacity-40">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {formState && (
        <LocationForm initial={formState.initial} editing={Boolean(formState.id)} saving={saving}
          onCancel={() => setFormState(null)} onSave={save} />
      )}
    </div>
  );
};

export default DeliveryLocationManager;
