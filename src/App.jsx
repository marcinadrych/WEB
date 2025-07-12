import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'

// Importy
import { Toaster } from '@/components/ui/toaster'
import MainLayout from './layouts/MainLayout'
import Auth from './pages/Auth'
import UpdatePassword from './pages/UpdatePassword'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Sprawdzamy sesję przy pierwszym załadowaniu
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Nasłuchujemy na zmiany stanu
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sprawdzamy, czy w adresie URL jest fragment od resetu hasła
  // Ta linia jest kluczowa i działa przy każdym renderze
  const isPasswordRecovery = location.hash.includes('type=recovery')

  if (loading) {
    return <div className="dark min-h-screen flex items-center justify-center"><p>Ładowanie...</p></div>
  }

  // --- GŁÓWNA LOGIKA ROUTINGU, KTÓRA MUSI ZADZIAŁAĆ ---

  // Jeśli nie ma sesji I NIE JESTEŚMY w trakcie resetu hasła, pokaż logowanie.
  if (!session && !isPasswordRecovery) {
    return (
      <div className="dark min-h-screen bg-background text-foreground">
        <Auth />
        <Toaster />
      </div>
    )
  }

  // W każdym innym przypadku (jest sesja LUB jesteśmy w trakcie resetu hasła),
  // użyj głównego routera, który sam zdecyduje co pokazać.
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Routes>
        {/* Jeśli to reset hasła, ta ścieżka zostanie dopasowana */}
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Każda inna ścieżka dla zalogowanego użytkownika trafi tutaj */}
        <Route path="/*" element={<MainLayout />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App