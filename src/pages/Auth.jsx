// src/pages/Auth.jsx

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

  // --- POPRAWIONA I UPROSZCZONA FUNKCJA LOGOWANIA ---
  const handleLogin = async (event) => {
    // Krok 1: Zapobiegamy przeładowaniu strony
    event.preventDefault()

    setLoading(true) // Włączamy stan ładowania
    
    // Krok 2: Wywołujemy funkcję logowania Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    // Krok 3: Obsługujemy wynik
    if (error) {
      toast({
        title: "Błąd logowania",
        description: "Nieprawidłowy e-mail lub hasło. Spróbuj ponownie.",
        variant: "destructive",
      })
    }
    // Jeśli logowanie się powiedzie, onAuthStateChange w App.jsx
    // automatycznie wykryje nową sesję i przerenderuje aplikację,
    // pokazując Dashboard. Nie musimy tu nic więcej robić.

    setLoading(false) // Wyłączamy stan ładowania na końcu
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
                placeholder="twoj@email.com"
                value={email}
                required={true}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                required={true}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {/* Upewniamy się, że przycisk ma type="submit" i jest wyłączany przez `loading` */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={loading}
                className="underline text-muted-foreground hover:text-primary disabled:opacity-50"
              >
                Nie pamiętasz hasła? Ustaw nowe.
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}