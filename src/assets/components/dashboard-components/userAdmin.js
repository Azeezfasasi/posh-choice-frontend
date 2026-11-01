// Shared helpers for the user management screens
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

export const ROLES = [
  { value: 'user', label: 'Customer', hint: 'Signed up on the website' },
  { value: 'customer', label: 'Customer (legacy)', hint: 'Older customer accounts' },
  { value: 'admin', label: 'Admin', hint: 'Manages orders, products and content' },
  { value: 'super admin', label: 'Super admin', hint: 'Full access, including admin accounts' },
];

export const ADMIN_ROLES = ['admin', 'super admin'];
export const MIN_PASSWORD = 8;

export const inputClass = 'w-full h-11 px-3.5 rounded-xl border border-line bg-white text-sm text-ink placeholder:text-ink-soft/70';

export const roleLabel = (role) => ROLES.find(r => r.value === role)?.label || role || 'Unknown';

export const ROLE_STYLE = {
  'super admin': 'bg-plum-600 text-white ring-plum-600',
  admin: 'bg-plum-50 text-plum-800 ring-plum-200',
  user: 'bg-cream text-ink ring-line',
  customer: 'bg-cream text-ink ring-line',
};

// Super admins manage everyone; admins only manage customer accounts (matches the backend rules)
export const canManage = (actor, target) =>
  actor?.role === 'super admin' || !ADMIN_ROLES.includes(target?.role);

export const userId = (u) => String(u?._id || u?.id || '');

export const errorMessage = (err, fallback) => err?.response?.data?.error || err?.response?.data?.message || fallback;

// Password strength 0-4
export const passwordScore = (pw = '') => {
  let score = 0;
  if (pw.length >= MIN_PASSWORD) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

export const generatePassword = (length = 14) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?';
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, v => chars[v % chars.length]).join('');
};

export const usersApi = {
  list: async () => (await axios.get(`${API_BASE_URL}/users`)).data,
  create: async (body) => (await axios.post(`${API_BASE_URL}/users`, body)).data,
  update: async (id, body) => (await axios.put(`${API_BASE_URL}/users/${id}`, body)).data,
  remove: async (id) => (await axios.delete(`${API_BASE_URL}/users/${id}`)).data,
  disable: async (id) => (await axios.patch(`${API_BASE_URL}/users/${id}/disable`)).data,
  // There is no "enable" endpoint; re-enabling is an edit
  enable: async (id) => (await axios.put(`${API_BASE_URL}/users/${id}`, { isActive: true })).data,
  resetPassword: async (id, newPassword) => (await axios.put(`${API_BASE_URL}/users/${id}/reset-password`, { newPassword })).data,
};
