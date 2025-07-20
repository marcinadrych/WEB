// src/layouts/MainLayout.jsx

import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Menu, Plus, PenSquare, PackagePlus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePWAInstall } from '@/hooks/usePWAInstall'; 

// Importy Stron - wszystko jest OK
import Dashboard from '@/pages/Dashboard';
import AddProduct from '@/pages/AddProduct';
import ZmienStan from '@/pages/ZmienStan';
import EditProduct from '@/pages/EditProduct';
import QRPage from '@/pages/QRPage';
import UpdatePassword from '@/pages/UpdatePassword';
import PrintLabelsPage from '@/pages/PrintLabelsPage';

export default function MainLayout() {
  const navigate = useNavigate();
  const { canInstall, handleInstall } = usePWAInstall();

  // --- TO JEST JEDYNA ZMIANA W LOGICE ---
  // Przenosimy tę logikę do wnętrza komponentu
  const location = useLocation();
  const handleLogoClick = (e) => {
    // Jeśli już jesteśmy na stronie głównej, zapobiegamy domyślnej akcji
    // i ręcznie przeładowujemy stronę.
    if (location.pathname === '/') {
      e.preventDefault(); // Zatrzymaj normalne działanie linku
      window.location.reload(); // Odśwież stronę
    }
    // Jeśli jesteśmy na innej podstronie, link zadziała normalnie.
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto flex h-16 items-center justify-between">
          
          {/* --- I ZMIANA TUTAJ, w linku "Magazyn" --- */}
          <Link to="/" onClick={handleLogoClick} className="text-xl font-bold">
            Magazyn
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link to="/"><Button variant="ghost">Stan Magazynu</Button></Link>
            <Link to="/zmien-stan"><Button variant="default">Zmień Stan</Button></Link>
            <Link to="/dodaj-produkt"><Button variant="outline">Nowy Produkt</Button></Link>
            <Link to="/update-password"><Button variant="secondary">Zmień Hasło</Button></Link>
            <Link to="/print-labels"><Button variant="outline">Drukuj QR</Button></Link>
            
            {canInstall && (
              <Button onClick={handleInstall}>
                <Download className="mr-2 h-4 w-4" /> Zainstaluj
              </Button>
            )}

            <Button onClick={handleLogout} variant="secondary">Wyloguj</Button>
          </nav>
          
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to="/">Stan Magazynu</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/update-password">Zmień Hasło</Link></DropdownMenuItem>
                
                {canInstall && (
                    <DropdownMenuItem onClick={handleInstall}>
                        <Download className="mr-2 h-4 w-4" /> Zainstaluj aplikację
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleLogout}>Wyloguj</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Twoja reszta kodu jest idealna i pozostaje nietknięta */}
      <main className="container mx-auto p-4 md:p-8 pb-24">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dodaj-produkt" element={<AddProduct />} />
          <Route path="/zmien-stan" element={<ZmienStan />} />
          <Route path="/edytuj-produkt/:id" element={<EditProduct />} />
          <Route path="/qr" element={<QRPage />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/print-labels" element={<PrintLabelsPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>

      <div className="md:hidden fixed bottom-6 right-6 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="rounded-full w-16 h-16 shadow-lg">
              <Plus className="h-8 w-8" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mb-2 w-56">
            <DropdownMenuItem onSelect={() => navigate('/zmien-stan')} className="py-3 text-lg">
              <PenSquare className="mr-2 h-5 w-5" />
              <span>Zmień Stan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/dodaj-produkt')} className="py-3 text-lg">
              <PackagePlus className="mr-2 h-5 w-5" />
              <span>Nowy Produkt</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}