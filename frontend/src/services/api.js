import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Token
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

// Clean Response Interceptor (No infinite redirect loops)
api.interceptors.response.use(
  (response) => {
    // If backend returns HTML (e.g. static host fallback), normalize safely
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
      return {
        data: {
          items: [],
          summary: { total_leads: 0, with_phone: 0, with_email: 0, with_website: 0, without_email: 0 },
          page: 1,
          total_pages: 1,
          total: 0
        }
      };
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
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

// Search & Discovery Services
export const searchService = {
  findLeads: async (searchParams) => {
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

// Lead Management Services
export const leadService = {
  getLeads: async (params = {}) => {
    try {
      const res = await api.get('/leads', { params });
      return res.data || { items: [], summary: { total_leads: 0, with_phone: 0, with_email: 0, with_website: 0, without_email: 0 }, page: 1, total_pages: 1, total: 0 };
    } catch (e) {
      return { items: [], summary: { total_leads: 0, with_phone: 0, with_email: 0, with_website: 0, without_email: 0 }, page: 1, total_pages: 1, total: 0 };
    }
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

// Export Services
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
