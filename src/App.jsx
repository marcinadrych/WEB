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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
      if (event === "PASSWORD_RECOVERY") {
        navigate("/update-password");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            if (window.location.pathname !== '/update-password') {
                navigate('/login', { replace: true });
            }
        }
        setSession(session)
        setLoading(false)
    })

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return <div className="dark min-h-screen flex items-center justify-center"><p>Ładowanie...</p></div>;
  }

  // Jeśli nie ma sesji, pokazujemy strony publiczne
  if (!session) {
    return (
      <div className="dark min-h-screen bg-background text-foreground"> {/* KLASA DARK TUTAJ */}
        <Routes>
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="*" element={<Auth />} />
        </Routes>
        <Toaster />
      </div>
    );
  }

  // Jeśli jest sesja, pokazujemy główną aplikację
  return (
    <div className="dark min-h-screen bg-background text-foreground"> {/* I KLASA DARK TUTAJ */}
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
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dodaj-produkt" element={<AddProduct />} />
          <Route path="/zmien-stan" element={<ZmienStan />} />
          <Route path="/edytuj-produkt/:id" element={<EditProduct />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default App;