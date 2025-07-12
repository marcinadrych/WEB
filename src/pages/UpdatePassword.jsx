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
    event.preventDefault()
    if (password.length < 6 || password !== confirmPassword) {
      toast({ title: "Błąd", description: "Hasła nie są takie same lub są za krótkie.", variant: "destructive" })
      return
    }

    setLoading(true)
    console.log("Próba aktualizacji hasła..."); // <<< SZPIEG NR 1

    const { data, error } = await supabase.auth.updateUser({ password: password })

    if (error) {
      console.error("Błąd z Supabase podczas aktualizacji hasła:", error); // <<< SZPIEG NR 2
      toast({ title: "Błąd serwera", description: error.message, variant: "destructive" })
    } else {
      console.log("Sukces! Hasło zaktualizowane. Dane użytkownika:", data); // <<< SZPIEG NR 3
      toast({ title: "Sukces!", description: "Hasło zostało zaktualizowane. Przekierowuję..." });
      setTimeout(() => {
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