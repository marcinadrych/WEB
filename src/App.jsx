import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Menu } from 'lucide-react'

// Komponenty UI
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Strony
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import AddProduct from './pages/AddProduct'
import ZmienStan from './pages/ZmienStan'
import EditProduct from './pages/EditProduct'
import UpdatePassword from './pages/UpdatePassword'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Sprawdzamy sesję przy pierwszym załadowaniu
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Ustawiamy nasłuchiwanie na zmiany stanu autentykacji
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Jeśli sesja się zmieni (np. ktoś się wyloguje), zaktualizuj stan
      setSession(session)
    })

    // Zakończ nasłuchiwanie, gdy komponent zostanie "odmontowany"
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Po wylogowaniu React automatycznie przerenderuje komponent,
    // a warunek `session ? ... : ...` pokaże stronę logowania.
    // Możemy dodać navigate dla pewności.
    navigate('/login', { replace: true })
  }

  // Pokaż ekran ładowania, dopóki nie sprawdzimy, czy jest sesja
  if (loading) {
    return <div className="dark min-h-screen flex items-center justify-center"><p>Ładowanie...</p></div>
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Routes>
        {session ? (
          // --- ŚCIEŻKI DLA ZALOGOWANEGO UŻYTKOWNIKA ---
          // Używamy "catch-all" (/*), żeby objąć wszystkie ścieżki po zalogowaniu
          <Route path="/*" element={
            <>
              <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                <div className="container mx-auto flex h-16 items-center justify-between">
                  <Link to="/" className="text-xl font-bold">Magazyn</Link>
                  <nav className="hidden md:flex items-center gap-4">
                    <Link to="/"><Button variant="ghost">Stan Magazynu</Button></Link>
                    <Link to="/zmien-stan"><Button variant="default">Zmień Stan</Button></Link>
                    <Link to="/dodaj-produkt"><Button variant="outline">Nowy Produkt</Button></Link>
                    <Button onClick={handleLogout} variant="secondary">Wyloguj</Button>
                  </nav>
                  <div className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Menu className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link to="/">Stan Magazynu</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link to="/zmien-stan">Zmień Stan</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link to="/dodaj-produkt">Nowy Produkt</Link></DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>Wyloguj</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </header>
              <main className="container mx-auto p-4 md:p-8">
                {/* Zagnieżdżony router dla podstron po zalogowaniu */}
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dodaj-produkt" element={<AddProduct />} />
                  <Route path="/zmien-stan" element={<ZmienStan />} />
                  <Route path="/edytuj-produkt/:id" element={<EditProduct />} />
                  {/* Ta ścieżka jest teraz częścią chronionych, co jest OK */}
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </main>
            </>
          } />
        ) : (
          // --- ŚCIEŻKI DLA NIEZALOGOWANEGO UŻYTKOWNIKA ---
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