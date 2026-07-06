import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Coffee, LogOut, LogIn, BookOpen, Calculator, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/so-cong-thuc', icon: BookOpen, label: 'Sổ Công Thức', mobileLabel: 'Sổ CT' },
  { to: '/tinh-toan', icon: Calculator, label: 'Tính Toán Pha Chế', mobileLabel: 'Tính toán' },
];

export const MainLayout = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>;

  const isActive = (to: string) => location.pathname === to;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-b md:border-r border-zinc-200 dark:border-zinc-800 flex md:flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 md:p-6 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Coffee size={20} className="text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight">Coffee Manager</p>
            <p className="text-xs text-zinc-400">Hệ thống pha chế</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex flex-col flex-1 px-3 py-4 gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}>
              <Button variant="ghost" className={`w-full justify-start gap-3 ${isActive(to) ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-semibold' : 'text-zinc-600 dark:text-zinc-400'}`}>
                <Icon size={19} />{label}
              </Button>
            </Link>
          ))}
          {isAuthenticated && (
            <Link to="/quan-ly">
              <Button variant="ghost" className={`w-full justify-start gap-3 ${isActive('/quan-ly') ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-semibold' : 'text-zinc-600 dark:text-zinc-400'}`}>
                <Settings size={19} />Quản lý Admin
              </Button>
            </Link>
          )}
        </nav>

        {/* User section */}
        <div className="hidden md:block p-3 border-t border-zinc-100 dark:border-zinc-800">
          {isAuthenticated ? (
            <>
              <div className="px-2 py-1.5 mb-2">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{user?.email}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</p>
              </div>
              <Button variant="outline" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm" onClick={logout}>
                <LogOut size={16} />Đăng xuất
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="w-full justify-start gap-2 text-amber-600 hover:bg-amber-50 text-sm">
                <LogIn size={16} />Đăng nhập (Admin)
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8 min-h-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-around items-stretch z-50 safe-area-pb">
        {navItems.map(({ to, icon: Icon, mobileLabel }) => (
          <Link key={to} to={to} className={`flex flex-col items-center justify-center py-2 px-3 flex-1 text-xs gap-1 transition-colors ${isActive(to) ? 'text-amber-600' : 'text-zinc-500'}`}>
            <Icon size={22} />
            <span className="font-medium">{mobileLabel}</span>
          </Link>
        ))}
        {isAuthenticated ? (
          <Link to="/quan-ly" className={`flex flex-col items-center justify-center py-2 px-3 flex-1 text-xs gap-1 transition-colors ${isActive('/quan-ly') ? 'text-amber-600' : 'text-zinc-500'}`}>
            <Settings size={22} /><span className="font-medium">Quản lý</span>
          </Link>
        ) : (
          <Link to="/login" className="flex flex-col items-center justify-center py-2 px-3 flex-1 text-xs gap-1 text-amber-600 transition-colors">
            <LogIn size={22} /><span className="font-medium">Đăng nhập</span>
          </Link>
        )}
      </nav>
    </div>
  );
};
