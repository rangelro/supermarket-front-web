import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sgm_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('sgm_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/token/refresh/', { refresh: refreshToken });
          const newAccessToken = res.data.access;
          localStorage.setItem('sgm_access_token', newAccessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (_refreshErr) {
          localStorage.removeItem('sgm_access_token');
          localStorage.removeItem('sgm_refresh_token');
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
