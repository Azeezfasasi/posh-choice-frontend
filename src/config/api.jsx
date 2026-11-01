import axios from 'axios';

// Set VITE_API_BASE_URL (e.g. https://your-backend.vercel.app/api) in .env.local / your host's env settings
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://posh-choice-backend.onrender.com/api").replace(/\/$/, '');

// Backend origin (no /api), used for legacy image paths like /uploads/...
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

// Attach the saved token to every axios request. Reading it at request time avoids
// races where a provider fetches data before the auth header has been set.
axios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // localStorage unavailable (private mode); send the request without a token
  }
  return config;
});

export const getProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}/products`);
  return response.data;
};
