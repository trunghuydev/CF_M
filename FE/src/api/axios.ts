import axios from 'axios';

// Production (Vercel): VITE_API_URL = /api  → proxy qua vercel.json → VPS
// Development (local): VITE_API_URL = http://localhost:8080/api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Axios instance chính cho toàn bộ app.
 * - withCredentials: true để Cookie (Refresh Token) được gửi tự động
 * - Access Token được inject bởi request interceptor
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Bắt buộc để HttpOnly Cookie được gửi kèm
  timeout: 15_000,
});

// ─── Request Interceptor: inject Access Token vào mọi request ───────────────
api.interceptors.request.use(
  (config) => {
    // Đọc token từ window.__accessToken (được AuthContext cập nhật)
    const token = (window as any).__accessToken as string | undefined;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: tự động refresh khi Access Token hết hạn ─────────
let isRefreshing = false;
// Hàng đợi các request thất bại 401 — sẽ được retry sau khi refresh thành công
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý lỗi 401 và không retry vô hạn
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Không thử refresh khi chính request /auth/refresh bị 401
    if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    // Nếu đang refresh thì xếp hàng chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    // Bắt đầu refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Gọi hàm refresh từ AuthContext (được expose qua window để tránh circular import)
      const refreshFn = (window as any).__refreshAccessToken as (() => Promise<string | null>) | undefined;

      if (!refreshFn) throw new Error('Refresh function not available');

      const newToken = await refreshFn();

      if (!newToken) {
        // Refresh Token hết hạn hoặc bị thu hồi → redirect về login
        processQueue(new Error('Session expired'), null);
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Cập nhật token trong window (AuthContext sẽ set state, nhưng cần ngay cho interceptor)
      (window as any).__accessToken = newToken;

      // Xử lý hàng đợi — retry tất cả request đang chờ với token mới
      processQueue(null, newToken);

      // Retry request gốc với token mới
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
