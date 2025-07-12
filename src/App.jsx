import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

  useEffect(() => {
    // Nasłuchujemy na zmiany stanu autentykacji
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    // Sprawdzamy początkową sesję
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sprawdzamy, czy w adresie URL jest fragment od resetu hasła
  const isPasswordRecovery = location.hash.includes('type=recovery')

  if (loading && !isPasswordRecovery) {
    return <div className="dark min-h-screen flex items-center justify-center"><p>Ładowanie...</p></div>
  }

  // --- OSTATECZNA LOGIKA ---

  // Jeśli adres URL wskazuje na reset hasła, ZAWSZE I BEZWARUNKOWO
  // pokazuj stronę do zmiany hasła. To jest najważniejszy warunek.
  if (isPasswordRecovery) {
    return (
      <div className="dark min-h-screen bg-background text-foreground">
        <UpdatePassword />
        <Toaster />
      </div>
    )
  }

  // Jeśli nie resetujemy hasła, to sprawdzamy, czy jest sesja.
  // Jeśli jest, pokazujemy główną aplikację.
  if (session) {
    return <MainApp />
  }

  // W każdym innym przypadku (brak sesji, brak resetu hasła),
  // pokazujemy stronę logowania.
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Auth />
      <Toaster />
    </div>
  )
}

// Wydzielamy główną aplikację do osobnego komponentu dla czystości
function MainApp() {
  const navigate = useNavigate();
  const handleLogout = () => {
    supabase.auth.signOut().then(() => {
      navigate('/login', { replace: true });
    });
  };

  return (
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
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dodaj-produkt" element={<AddProduct />} />
          <Route path="/zmien-stan" element={<ZmienStan />} />
          <Route path="/edytuj-produkt/:id" element={<EditProduct />} />
          {/* Jeśli zalogowany użytkownik jest na stronie /update-password, też mu ją pokażemy */}
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </>
  )
}

export default App