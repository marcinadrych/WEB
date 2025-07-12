import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
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
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Sprawdzamy sesję przy pierwszym załadowaniu
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Nasłuchujemy na zmiany
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sprawdzamy, czy w adresie URL jest fragment od resetu hasła
  const isPasswordRecovery = location.hash.includes('type=recovery')

  if (loading) {
    return <div className="dark min-h-screen flex items-center justify-center"><p>Ładowanie...</p></div>
  }

  // Jeśli nie ma sesji I nie jesteśmy w trakcie resetu hasła, pokaż logowanie.
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
      {/* Nawigacja będzie widoczna tylko jeśli jest sesja i nie resetujemy hasła */}
      {session && !isPasswordRecovery && (
        <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <div className="container mx-auto flex h-16 items-center justify-between">
            <Link to="/" className="text-xl font-bold">Magazyn</Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link to="/"><Button variant="ghost">Stan Magazynu</Button></Link>
              <Link to="/zmien-stan"><Button variant="default">Zmień Stan</Button></Link>
              <Link to="/dodaj-produkt"><Button variant="outline">Nowy Produkt</Button></Link>
              <Button onClick={() => supabase.auth.signOut()} variant="secondary">Wyloguj</Button>
            </nav>
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Menu className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link to="/">Stan Magazynu</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/zmien-stan">Zmień Stan</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/dodaj-produkt">Nowy Produkt</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => supabase.auth.signOut()}>Wyloguj</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      )}

      <main className="container mx-auto p-4 md:p-8">
        <Routes>
          {/* Jeśli to reset hasła, ta ścieżka zostanie dopasowana */}
          {isPasswordRecovery && <Route path="*" element={<UpdatePassword />} />}
          
          {/* Ścieżki dla zalogowanego użytkownika */}
          {session && (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dodaj-produkt" element={<AddProduct />} />
              <Route path="/zmien-stan" element={<ZmienStan />} />
              <Route path="/edytuj-produkt/:id" element={<EditProduct />} />
              {/* Jeśli zalogowany użytkownik wejdzie na nieznany adres, wróci na dashboard */}
              <Route path="*" element={<Dashboard />} /> 
            </>
          )}
        </Routes>
      </main>
      <Toaster />
    </div>
  )
}

export default App