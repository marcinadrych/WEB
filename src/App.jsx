import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Menu } from 'lucide-react'

// Komponenty UI i Strony
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

  useEffect(() => {
    // Najpierw sprawdzamy, czy już mamy sesję z poprzednich odwiedzin
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    });

    // Potem ustawiamy nasłuchiwanie na przyszłe zmiany
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Ekran ładowania, dopóki nie zakończymy sprawdzania sesji
  if (loading) {
    return <div className="dark min-h-screen flex items-center justify-center"><p>Ładowanie...</p></div>;
  }
  
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Routes>
        {/* Jeśli jest sesja, renderuj główną, chronioną część aplikacji */}
        {session ? (
            <Route path="/*" element={
              <>
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
                <main className="container mx-auto p-4 md:p-8">
                  {/* Zagnieżdżony router dla zalogowanych użytkowników */}
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dodaj-produkt" element={<AddProduct />} />
                    <Route path="/zmien-stan" element={<ZmienStan />} />
                    <Route path="/edytuj-produkt/:id" element={<EditProduct />} />
                    {/* Strona zmiany hasła jest teraz częścią chronionych ścieżek */}
                    <Route path="/update-password" element={<UpdatePassword />} /> 
                    <Route path="*" element={<Dashboard />} />
                  </Routes>
                </main>
              </>
            } />
        ) : (
          // Jeśli nie ma sesji, renderuj tylko stronę logowania
          <Route path="*" element={<Auth />} />
        )}
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;