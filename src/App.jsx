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
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    });

    // Ustaw nasłuchiwanie na zmiany stanu autentykacji (logowanie, wylogowanie, reset hasła)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    });

    // Zakończ nasłuchiwanie, gdy komponent zostanie "odmontowany"
    return () => subscription.unsubscribe()
  }, []);

  // Funkcja do obsługi wylogowania
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/') // Po wylogowaniu przekieruj na stronę główną (która pokaże Auth)
  };

  // Logika decydująca, co pokazać
  return (
    <div className="min-h-screen bg-background text-foreground">
      {session ? (
        // --- WIDOK DLA ZALOGOWANEGO UŻYTKOWNIKA ---
        <>
          <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <div className="container mx-auto flex h-16 items-center justify-between">
              <Link to="/" className="text-xl font-bold">Magazyn</Link>
              
              {/* Nawigacja na duże ekrany */}
              <nav className="hidden md:flex items-center gap-4">
                <Link to="/"><Button variant="ghost">Stan Magazynu</Button></Link>
                <Link to="/zmien-stan"><Button variant="default">Zmień Stan</Button></Link>
                <Link to="/dodaj-produkt"><Button variant="outline">Nowy Produkt</Button></Link>
                <Button onClick={handleLogout} variant="secondary">Wyloguj</Button>
              </nav>

              {/* Nawigacja na małe ekrany */}
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
              {/* Strona zmiany hasła jest też dostępna dla zalogowanych, na wypadek gdyby chcieli zmienić */}
              <Route path="/update-password" element={<UpdatePassword />} />
            </Routes>
          </main>
        </>
      ) : (
        // --- WIDOK DLA NIEZALOGOWANEGO UŻYTKOWNIKA ---
        <Routes>
          {/* Definiujemy, że adres /update-password ma prowadzić do komponentu UpdatePassword */}
          <Route path="/update-password" element={<UpdatePassword />} />
          {/* Każdy inny adres (*) ma prowadzić do komponentu logowania Auth */}
          <Route path="*" element={<Auth />} />
        </Routes>
      )}
      
      {/* Toaster musi być renderowany zawsze, żeby powiadomienia działały na każdej stronie */}
      <Toaster />
    </div>
  )
}

export default App