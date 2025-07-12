// src/pages/UpdatePassword.jsx

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

  // Ten useEffect nasłuchuje na specjalny event, który Supabase wysyła
  // po udanym zalogowaniu przez link do resetu hasła.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Nic nie rób, po prostu pozwól użytkownikowi być na tej stronie
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (event) => {
    event.preventDefault()
    if (password.length < 6) { /* ... walidacja ... */ return }
    if (password !== confirmPassword) { /* ... walidacja ... */ return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: password })

    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Sukces!", description: "Hasło zostało zaktualizowane. Możesz się teraz zalogować." })
      await supabase.auth.signOut(); // Wyloguj użytkownika po zmianie hasła
      navigate('/login') // Przekieruj na stronę logowania
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