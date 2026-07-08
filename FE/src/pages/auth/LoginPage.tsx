import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import api from '@/api/axios';
import { Lock, Mail } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' }),
});

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', values);
      // API mới trả về accessToken (thay vì token cũ)
      login(res.data.accessToken, res.data.user);
      toast('success', 'Đăng nhập thành công!');
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Email hoặc mật khẩu không đúng.';
      toast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden border-2 border-amber-200 dark:border-amber-900 shadow-lg shadow-amber-200 dark:shadow-amber-900/50">
            <img src="/tori_icon.png" alt="Tori Coffee" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tori Coffee</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Đăng nhập để quản trị hệ thống</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <Input
                          placeholder="admin@coffee.com"
                          className="pl-9 h-11"
                          inputMode="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Mật khẩu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-9 h-11"
                          autoComplete="current-password"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold rounded-xl transition-all mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Đang đăng nhập...
                  </span>
                ) : 'Đăng nhập'}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-5">
          Hệ thống quản lý công thức pha chế nội bộ
        </p>
      </div>
    </div>
  );
};
