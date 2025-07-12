// src/layouts/MainLayout.jsx

import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/supabaseClient'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Importujemy strony, które mają być renderowane wewnątrz
import Dashboard from '@/pages/Dashboard'
import AddProduct from '@/pages/AddProduct'
import ZmienStan from '@/pages/ZmienStan'
import EditProduct from '@/pages/EditProduct'
import UpdatePassword from '@/pages/UpdatePassword'

export default function MainLayout() {
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
        {/* KLUCZOWA POPRAWKA: Zagnieżdżony router, który renderuje podstrony */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dodaj-produkt" element={<AddProduct />} />
          <Route path="/zmien-stan" element={<ZmienStan />} />
          <Route path="/edytuj-produkt/:id" element={<EditProduct />} />
          <Route path="*" element={<Dashboard />} /> 
        </Routes>
      </main>
    </>
  )
}