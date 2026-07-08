import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { User } from '@/types';
import axios from 'axios';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  /** Dùng nội bộ bởi axios interceptor để cập nhật access token mới sau khi refresh */
  setAccessToken: (token: string) => void;
}

// ─── Axios instance thuần (không dùng interceptor) chỉ để gọi /auth/refresh ──
// Dùng riêng để tránh circular dependency với api instance chính
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export const authAxios = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Bắt buộc để Cookie được gửi kèm request
  headers: { 'Content-Type': 'application/json' },
});

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Ref để các module khác (axios interceptor) có thể gọi refresh mà không gây re-render
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  /**
   * Gọi /auth/refresh để lấy Access Token mới từ Refresh Token trong Cookie.
   * Trả về accessToken mới nếu thành công, null nếu thất bại.
   * Deduplicate: nếu đang có refresh request đang chạy thì không gọi lại.
   */
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // Nếu đang refresh rồi thì đợi kết quả chung thay vì gọi song song
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = (async () => {
      try {
        const res = await authAxios.post('/auth/refresh');
        const newToken: string = res.data.accessToken;
        const newUser: User = res.data.user;
        setAccessTokenState(newToken);
        setUser(newUser);
        return newToken;
      } catch {
        // Refresh Token hết hạn hoặc bị thu hồi → xóa state
        setAccessTokenState(null);
        setUser(null);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, []);

  /**
   * Khi App khởi động: gọi /auth/refresh để khôi phục session nếu Cookie còn hợp lệ.
   * Đây là cơ chế "silent login" — người dùng không cần đăng nhập lại.
   */
  useEffect(() => {
    const initAuth = async () => {
      await refreshAccessToken();
      setLoading(false);
    };
    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Được gọi sau khi login thành công — lưu token vào state (không lưu localStorage) */
  const login = useCallback((token: string, userData: User) => {
    setAccessTokenState(token);
    setUser(userData);
  }, []);

  /** Logout: gọi API để revoke Cookie phía server, xóa state phía client */
  const logout = useCallback(async () => {
    try {
      await authAxios.post('/auth/logout');
    } catch {
      // Bỏ qua lỗi — có thể cookie đã hết hạn
    }
    setAccessTokenState(null);
    setUser(null);
  }, []);

  const setAccessToken = useCallback((token: string) => {
    setAccessTokenState(token);
  }, []);

  // Expose refreshAccessToken qua window để axios interceptor có thể gọi
  // mà không tạo circular import
  useEffect(() => {
    (window as any).__refreshAccessToken = refreshAccessToken;
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      setAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
