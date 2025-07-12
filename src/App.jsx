// src/App.jsx - OSTATECZNA WERSJA LOGIKI ROUTINGU

import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation() // Hook do sprawdzania adresu URL

  useEffect(() => {
    // Nasłuchujemy na zmiany stanu autentykacji
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Sprawdzamy sesję przy pierwszym załadowaniu, ale z opóźnieniem
    // żeby dać routerowi czas na ewentualne przekierowanie na /update-password
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setLoading(false)
      })
    }, 100) // Małe opóźnienie

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);
  
  // Sprawdzamy, czy w adresie URL jest fragment od resetu hasła.
  // Supabase dodaje #access_token=...&type=recovery
  const isPasswordRecovery = location.hash.includes('type=recovery');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  // Ekran ładowania
  if (loading && !isPasswordRecovery) {
    return <div className="dark min-h-screen flex items-center justify-center"><p>Ładowanie...</p></div>;
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Routes>
        {/* Jeśli to reset hasła, zawsze pokazuj tę stronę */}
        {isPasswordRecovery && <Route path="*" element={<UpdatePassword />} />}
        
        {/* Jeśli jest sesja i nie resetujemy hasła, pokaż główną aplikację */}
        {session && !isPasswordRecovery && (
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
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dodaj-produkt" element={<AddProduct />} />
                  <Route path="/zmien-stan" element={<ZmienStan />} />
                  <Route path="/edytuj-produkt/:id" element={<EditProduct />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </main>
            </>
          } />
        )}

        {/* Jeśli nie ma sesji i nie resetujemy hasła, pokaż logowanie */}
        {!session && !isPasswordRecovery && <Route path="*" element={<Auth />} />}
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;