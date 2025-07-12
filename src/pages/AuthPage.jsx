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

  // Funkcja do obsługi logowania przez e-mail i hasło
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
    // Jeśli logowanie się powiedzie, onAuthStateChange w App.jsx
    // automatycznie obsłuży zmianę sesji i przerenderuje aplikację.
    setLoading(false)
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
          </form>
        </CardContent>
      </Card>
    </div>
  )
}