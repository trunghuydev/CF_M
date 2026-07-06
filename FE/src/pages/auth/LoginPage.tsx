import  { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import api from '@/api/axios';
import { Coffee } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' }),
});

export const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setError('');
      setLoading(true);
      const res = await api.post('/auth/login', values);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800">
        <CardHeader className="space-y-3 items-center text-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2">
            <Coffee size={28} />
          </div>
          <CardTitle className="text-2xl font-bold">Coffee Manager</CardTitle>
          <CardDescription>Đăng nhập với tài khoản Quản trị viên</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@coffee.com" {...field} />
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
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <p>Hệ thống quản lý công thức pha chế nội bộ</p>
        </CardFooter>
      </Card>
    </div>
  );
};
