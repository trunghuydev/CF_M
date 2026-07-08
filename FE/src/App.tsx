import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { RecipeCalculatorPage } from '@/pages/recipe/RecipeCalculatorPage';
import { RecipeBookPage } from '@/pages/recipe/RecipeBookPage';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 phút
    },
  },
});

/**
 * Bridge component: đồng bộ accessToken từ React state vào window.__accessToken
 * để axios interceptor có thể đọc mà không tạo circular import.
 */
const TokenBridge = () => {
  const { accessToken } = useAuth();
  useEffect(() => {
    (window as any).__accessToken = accessToken ?? undefined;
  }, [accessToken]);
  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TokenBridge />
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/so-cong-thuc" replace />} />
                <Route path="so-cong-thuc" element={<RecipeBookPage />} />
                <Route path="quan-ly" element={<DashboardPage />} />
                <Route path="tinh-toan" element={<RecipeCalculatorPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
