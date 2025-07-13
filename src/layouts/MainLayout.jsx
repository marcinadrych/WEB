// src/layouts/MainLayout.jsx

import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Importujemy wszystkie strony, które ten layout będzie renderował
import Dashboard from '@/pages/Dashboard';
import AddProduct from '@/pages/AddProduct';
import ZmienStan from '@/pages/ZmienStan';
import EditProduct from '@/pages/EditProduct';
import QRPage from '@/pages/QRPage';

export default function MainLayout() {
  const { signOut } = useAuth();

  return (
    <>
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            Magazyn Adrych
          </Link>
          
          {/* Nawigacja na duże ekrany */}
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/"><Button variant="ghost">Stan Magazynu</Button></Link>
            <Link to="/zmien-stan"><Button variant="default">Zmień Stan</Button></Link>
            <Link to="/dodaj-produkt"><Button variant="outline">Nowy Produkt</Button></Link>
            <Button onClick={signOut} variant="secondary">Wyloguj</Button>
          </nav>

          {/* Nawigacja na małe ekrany (Hamburger) */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon"><Menu className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to="/">Stan Magazynu</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/zmien-stan">Zmień Stan</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/dodaj-produkt">Nowy Produkt</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>Wyloguj</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        {/* Zagnieżdżony router renderuje odpowiednią stronę */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dodaj-produkt" element={<AddProduct />} />
          <Route path="/zmien-stan" element={<ZmienStan />} />
          <Route path="/edytuj-produkt/:id" element={<EditProduct />} />
          <Route path="/qr" element={<QRPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </>
  )
}