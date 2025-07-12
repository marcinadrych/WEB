import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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
  const { toast } = useToast()
  const location = useLocation()

  // 🔐 Odczytaj tokeny z URL-a (query lub hash) i ustaw sesję Supabase
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const hashParams = new URLSearchParams(location.hash.replace('#', ''))

    const access_token = searchParams.get('access_token') || hashParams.get('access_token')
    const refresh_token = searchParams.get('refresh_token') || hashParams.get('refresh_token')

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).catch((error) => {
        console.error("Błąd ustawiania sesji:", error)
      })
    }
  }, [location])

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
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" })
      setLoading(false)
    } else {
      toast({
        title: "Sukces!",
        description: "Hasło zostało zaktualizowane. Za chwilę zostaniesz przekierowany na stronę logowania.",
      })

      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
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
            <Button type="submit" className="w-full text-base" disabled={loading}>
              {loading ? 'Zapisywanie...' : 'Zapisz nowe hasło'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
