"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Box, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Append a dummy domain to the username to use it as an email
      const email = `${username}@shopadmin.pro`;
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      let errorMessage = "Не вдалося увійти. Перевірте логін та пароль.";
      if (error.code === 'auth/invalid-email') {
          errorMessage = "Невірний формат логіну."
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          errorMessage = "Невірний логін або пароль."
      }
      toast({
        variant: "destructive",
        title: "Помилка входу",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
            <div className="flex justify-center">
                <div className="p-3 rounded-lg bg-primary text-primary-foreground w-fit">
                    <Box size={32} />
                </div>
            </div>
          <h1 className="text-3xl font-bold">Вхід в ShopAdminPro</h1>
          <p className="text-muted-foreground">Введіть ваш логін та пароль для входу</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Логін</Label>
            <Input
              id="username"
              type="text"
              placeholder="admin"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Увійти
          </Button>
        </form>
      </div>
    </div>
  );
}
