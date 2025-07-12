import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

// Importy UI i Layoutu
import { Toaster } from '@/components/ui/toaster'
import MainLayout from './layouts/MainLayout'

// Importy Stron
import Auth from './pages/Auth'
import UpdatePassword from './pages/UpdatePassword'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Sprawdź sesję przy pierwszym załadowaniu
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Ustaw nasłuchiwanie na zmiany stanu
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Przekieruj na /update-password, jeśli w URL jest 'type=recovery'
  // To jest kluczowa logika, która musi być w App.jsx
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      navigate('/update-password', { replace: true })
    }
  }, [navigate])

  if (loading) {
    return <div className="dark min-h-screen flex items-center justify-center"><p>Ładowanie...</p></div>
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Routes>
        {session ? (
          // Jeśli jest sesja, renderuj główny layout
          <Route path="/*" element={<MainLayout />} />
        ) : (
          // Jeśli nie ma sesji, renderuj tylko strony publiczne
          <>
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="*" element={<Auth />} />
          </>
        )}
      </Routes>
      <Toaster />
    </div>
  )
}

export default App