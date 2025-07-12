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

    if (password.length < 6) {
      toast({ title: "Błąd", description: "Hasło musi mieć co najmniej 6 znaków.", variant: "destructive" })
      return
    }

    if (password !== confirmPassword) {
      toast({ title: "Błąd", description: "Hasła nie są takie same.", variant: "destructive" })
      return
    }

    setLoading(true)
    // Supabase wie, kim jest użytkownik, na podstawie unikalnego tokena w adresie URL
    const { error } = await supabase.auth.updateUser({ password: password })

    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Sukces!", description: "Twoje hasło zostało pomyślnie zaktualizowane. Możesz się teraz zalogować." })
      navigate('/') // Przekieruj na stronę logowania (lub główną)
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
              <Label htmlFor="password">Nowe hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="text-base"
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
                className="text-base"
              />
            </div>
            <div>
              <Button type="submit" className="w-full text-base" disabled={loading}>
                {loading ? <span>Zapisywanie...</span> : <span>Zapisz nowe hasło</span>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}