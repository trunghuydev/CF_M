import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Coffee, LogOut, LogIn, BookOpen, Calculator, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/so-cong-thuc', icon: BookOpen, label: 'Sổ Công Thức', mobileLabel: 'Sổ CT' },
  { to: '/tinh-toan', icon: Calculator, label: 'Tính Toán', mobileLabel: 'Tính toán' },
];

export const MainLayout = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isActive = (to: string) => location.pathname === to;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">

      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-col shrink-0 h-screen sticky top-0">
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Coffee size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">Coffee Manager</p>
            <p className="text-xs text-zinc-400">Hệ thống pha chế</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col flex-1 px-3 py-4 gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}>
              <Button variant="ghost" className={`w-full justify-start gap-3 h-10 text-sm ${isActive(to) ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-semibold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
                <Icon size={18} />{label}
              </Button>
            </Link>
          ))}
          {isAuthenticated && (
            <Link to="/quan-ly">
              <Button variant="ghost" className={`w-full justify-start gap-3 h-10 text-sm ${isActive('/quan-ly') ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-semibold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
                <Settings size={18} />Quản lý Admin
              </Button>
            </Link>
          )}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
                <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">{user?.email}</p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs h-8" onClick={logout}>
                <LogOut size={14} />Đăng xuất
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-amber-600 hover:bg-amber-50 text-xs h-8">
                <LogIn size={14} />Đăng nhập (Admin)
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* ── Mobile Top Bar ──────────────────────────────────────────── */}
      <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Coffee size={16} className="text-white" />
        </div>
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex-1">Coffee Manager</span>
        {isAuthenticated ? (
          <button onClick={logout} className="text-xs text-red-500 font-medium flex items-center gap-1">
            <LogOut size={14} />
          </button>
        ) : (
          <Link to="/login" className="text-xs text-amber-600 font-semibold">Đăng nhập</Link>
        )}
      </div>

      {/* ── Main Content ────────────────────────────────────────────── */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* ── Mobile Bottom Nav ───────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex z-50"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map(({ to, icon: Icon, mobileLabel }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center py-2 px-2 flex-1 text-[11px] gap-1 transition-colors ${isActive(to) ? 'text-amber-600' : 'text-zinc-400'}`}
          >
            <Icon size={21} strokeWidth={isActive(to) ? 2.5 : 1.8} />
            <span className="font-medium leading-none">{mobileLabel}</span>
          </Link>
        ))}
        {isAuthenticated ? (
          <Link to="/quan-ly" className={`flex flex-col items-center justify-center py-2 px-2 flex-1 text-[11px] gap-1 transition-colors ${isActive('/quan-ly') ? 'text-amber-600' : 'text-zinc-400'}`}>
            <Settings size={21} strokeWidth={isActive('/quan-ly') ? 2.5 : 1.8} />
            <span className="font-medium leading-none">Quản lý</span>
          </Link>
        ) : (
          <Link to="/login" className="flex flex-col items-center justify-center py-2 px-2 flex-1 text-[11px] gap-1 text-zinc-400 transition-colors">
            <LogIn size={21} strokeWidth={1.8} />
            <span className="font-medium leading-none">Admin</span>
          </Link>
        )}
      </nav>
    </div>
  );
};
