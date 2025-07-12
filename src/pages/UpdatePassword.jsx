import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function UpdatePassword() {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  // Ten useEffect nasłuchuje na specjalny event, który Supabase wysyła,
  // gdy użytkownik trafia tu z linka w mailu. To jest kluczowy brakujący element.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // To zdarzenie potwierdza, że mamy tymczasową sesję do zmiany hasła.
        // Nie musimy nic robić, po prostu pozwalamy użytkownikowi być na tej stronie.
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (event) => {
    event.preventDefault()
    if (password.length < 6) {
      toast({ title: "Błąd", description: "Hasło musi mieć co najmniej 6 znaków.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Błąd", description: "Hasła nie są takie same.", variant: "destructive" });
      return;
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: password })

    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" })
      setLoading(false)
    } else {
      toast({ title: "Sukces!", description: "Hasło zostało zaktualizowane. Przekierowuję do logowania..." });
      // Wylogowujemy użytkownika i przekierowujemy go na stronę logowania
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
      }, 2000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Ustaw Nowe Hasło</CardTitle>
          <CardDescription>Wprowadź swoje nowe hasło poniżej.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nowe hasło (min. 6 znaków)</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz nowe hasło'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}