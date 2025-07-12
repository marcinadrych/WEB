import { useState } from 'react'
import { supabase } from '@/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const { toast } = useToast()

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    })

    if (error) {
      toast({
        title: "Błąd logowania",
        description: error.error_description || error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Link wysłany!",
        description: "Sprawdź swoją skrzynkę e-mail, aby dokończyć logowanie.",
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Magazyn Hydraulika</CardTitle>
          <CardDescription>Zaloguj się, aby uzyskać dostęp</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <Input
                className="text-base"
                type="email"
                placeholder="Twój e-mail"
                value={email}
                required={true}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Button type="submit" className="w-full text-base" disabled={loading}>
                {loading ? <span>Wysyłanie...</span> : <span>Wyślij link do logowania</span>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}