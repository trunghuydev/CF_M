import axios from 'axios';

// Vite đọc VITE_API_URL từ:
//   yarn dev   → .env.development  (http://localhost:8080/api)
//   yarn build → .env.production a  (http://160.191.237.191:8080/api)
// Nếu không có env → fallback về VPS
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://160.191.237.191:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
