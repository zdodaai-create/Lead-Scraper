import axios from 'axios';

// Safely normalize VITE_API_BASE_URL / VITE_API_URL
const resolveApiBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
  if (envUrl) {
    envUrl = envUrl.replace(/\/+$/, '');
    if (!envUrl.endsWith('/api')) {
      envUrl = `${envUrl}/api`;
    }
    return envUrl;
  }

  // Default target for Netlify production deployment
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    return 'https://lead-finder-single-app.onrender.com/api';
  }

  return '/api';
};

const API_BASE_URL = resolveApiBaseUrl();
console.log(`[Lead Finder API] Initialized with Base URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('leadfinder_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export const authService = {
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const searchService = {
  findLeads: async (searchParams) => {
    console.log(`[Lead Finder API] Executing POST to ${API_BASE_URL}/search for region: ${searchParams.region}`);
    const res = await api.post('/search', searchParams);
    return res.data;
  },
  getSavedSearches: async () => {
    const res = await api.get('/searches');
    return res.data;
  },
  deleteSearch: async (id) => {
    const res = await api.delete(`/searches/${id}`);
    return res.data;
  },
};

export const leadService = {
  getLeads: async (params = {}) => {
    const res = await api.get('/leads', { params });
    return res.data || { items: [], summary: { total_leads: 0, with_phone: 0, with_email: 0, with_website: 0, without_email: 0 }, page: 1, total_pages: 1, total: 0 };
  },
  getLeadById: async (id) => {
    const res = await api.get(`/leads/${id}`);
    return res.data;
  },
  updateLead: async (id, data) => {
    const res = await api.patch(`/leads/${id}`, data);
    return res.data;
  },
  deleteLead: async (id) => {
    const res = await api.delete(`/leads/${id}`);
    return res.data;
  },
  batchDeleteLeads: async (leadIds) => {
    const res = await api.post('/leads/batch-delete', leadIds);
    return res.data;
  },
};

export const exportService = {
  downloadExcel: async (searchId = null) => {
    const url = searchId ? `/export/excel?search_id=${searchId}` : '/export/excel';
    const res = await api.get(url, { responseType: 'blob' });
    return res.data;
  },
  downloadCSV: async (searchId = null) => {
    const url = searchId ? `/export/csv?search_id=${searchId}` : '/export/csv';
    const res = await api.get(url, { responseType: 'blob' });
    return res.data;
  },
  exportSelected: async (leadIds, format = 'excel') => {
    const res = await api.post('/export', { lead_ids: leadIds, format }, { responseType: 'blob' });
    return res.data;
  },
};

export default api;
