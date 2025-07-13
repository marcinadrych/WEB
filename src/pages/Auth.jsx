// src/pages/Auth.jsx

import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate(); // 🔁 Dodano

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: 'Błąd logowania',
        description: 'Nieprawidłowy e-mail lub hasło.',
        variant: 'destructive',
      });
    } else {
      // 🔁 Po udanym logowaniu – przekieruj
      navigate('/');
    }

    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Brak adresu e-mail',
        description: 'Wpisz swój adres e-mail, a potem kliknij ten link.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const redirectTo = `${window.location.origin}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Link wysłany!',
        description: 'Sprawdź skrzynkę e-mail, aby ustawić nowe hasło.',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Magazyn Hydraulika</CardTitle>
          <CardDescription>Zaloguj się, aby uzyskać dostęp</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="underline text-muted-foreground hover:text-primary"
              >
                Nie pamiętasz hasła? Ustaw nowe.
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
