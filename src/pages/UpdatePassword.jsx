// src/pages/UpdatePassword.jsx

import { useState } from 'react'
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

  const handleUpdatePassword = async (event) => {
    // Krok 1: Zapobiegamy domyślnemu przeładowaniu strony
    event.preventDefault()

    // Krok 2: Walidacja - sprawdzamy, czy hasła są wystarczająco długie i takie same
    if (password.length < 6) {
      toast({ title: "Błąd", description: "Hasło musi mieć co najmniej 6 znaków.", variant: "destructive" })
      return
    }
    if (password !== confirmPassword) {
      toast({ title: "Błąd", description: "Hasła nie są takie same.", variant: "destructive" })
      return
    }

    setLoading(true)
    
    // Krok 3: Wywołujemy funkcję Supabase do aktualizacji hasła użytkownika
    // Supabase automatycznie wie, kim jest użytkownik, dzięki tokenowi z URL-a,
    // który jest przechowywany w sesji przeglądarki.
    const { error } = await supabase.auth.updateUser({ password: password })

    // Krok 4: Obsługa wyniku
    if (error) {
      toast({ title: "Błąd", description: "Nie udało się zaktualizować hasła. Spróbuj ponownie.", variant: "destructive" })
    } else {
      toast({ title: "Sukces!", description: "Hasło zostało zaktualizowane. Za chwilę zostaniesz przekierowany." })
      
      // Krok 5: Czekamy 2 sekundy i przekierowujemy na stronę logowania
      setTimeout(() => {
        // Twarde przeładowanie na stronę logowania jest najpewniejsze
        window.location.href = "/login";
      }, 2000);
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Ustaw Nowe Hasło</CardTitle>
          <CardDescription>Wprowadź swoje nowe hasło poniżej.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Upewniamy się, że formularz ma podpiętą funkcję `onSubmit` */}
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nowe hasło (min. 6 znaków)</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {/* Przycisk jest typu "submit", więc wywoła `onSubmit` formularza */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Zapisywanie...' : 'Zapisz nowe hasło'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}