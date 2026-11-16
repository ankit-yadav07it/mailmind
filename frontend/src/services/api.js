import axios from 'axios';

// Auto-clean any brackets, spaces, or formatting quirks from VITE_API_URL
const rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/[<>\s]/g, '');
const normalizedBase = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL: normalizedBase,
  timeout: 15000,
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401 clear storage and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
