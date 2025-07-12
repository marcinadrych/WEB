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
  const { toast } = useToast() // Inicjalizujemy hook do toastów

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      toast({
        title: "Błąd logowania",
        description: "Nieprawidłowy e-mail lub hasło.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Brak adresu e-mail",
        description: "Najpierw wpisz swój adres e-mail w polu powyżej, a potem kliknij ten link.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const redirectTo = `${window.location.origin}/update-password`;

    // Wywołujemy funkcję resetowania hasła z Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false); // Zatrzymujemy ładowanie niezależnie od wyniku

    // Wyświetlamy powiadomienie na podstawie wyniku
    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Link wysłany!", description: "Sprawdź swoją skrzynkę e-mail, aby ustawić nowe hasło." });
    }
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
                className="text-base"
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
                className="text-base"
              />
            </div>
            <div>
              <Button type="submit" className="w-full text-base" disabled={loading}>
                {loading ? <span>Logowanie...</span> : <span>Zaloguj się</span>}
              </Button>
            </div>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={loading} // Wyłączamy przycisk podczas wysyłania
                className="underline text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                {loading ? 'Wysyłanie...' : 'Nie pamiętasz hasła? Ustaw nowe.'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}