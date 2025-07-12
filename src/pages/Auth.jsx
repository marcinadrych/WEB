import { useState } from 'react'
import { supabase } from '@/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { toast } = useToast()

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // Jeśli jest błąd, rzucamy go, żeby złapał go blok `catch`
        throw error;
      }
      // Jeśli logowanie się powiedzie, onAuthStateChange w App.jsx zajmie się resztą.
      // Nie musimy tu nic więcej robić.
      
    } catch (error) {
      // Niezależnie od błędu, pokazujemy toasta
      toast({
        title: "Błąd logowania",
        description: "Nieprawidłowy e-mail lub hasło.",
        variant: "destructive",
      });
    } finally {
      // Ten blok wykona się ZAWSZE, niezależnie od tego, czy był błąd, czy nie.
      // Gwarantuje to, że przycisk zawsze się odblokuje.
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Brak adresu e-mail", description: "Wpisz swój e-mail, a potem kliknij ten link.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Link wysłany!", description: "Sprawdź swoją skrzynkę e-mail." });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Magazyn Adrych</CardTitle>
          <CardDescription>Zaloguj się, aby uzyskać dostęp</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Hasło</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logowanie...' : 'Zaloguj się'}</Button>
            <div className="text-center text-sm">
              <button type="button" onClick={handlePasswordReset} disabled={loading} className="underline text-muted-foreground hover:text-primary disabled:opacity-50">
                Nie pamiętasz hasła? Ustaw nowe.
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}