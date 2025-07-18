// src/pages/Dashboard.jsx

import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '@/supabaseClient'
// --- ZMIANA NR 1: Zmieniamy import, żeby mieć dostęp do bardziej zaawansowanych opcji ---
import { Html5Qrcode } from 'html5-qrcode'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ProductListItem from '@/components/ProductListItem'
import SearchResultItem from '@/components/SearchResultItem'
import { QrCode } from 'lucide-react'

const qrcodeRegionId = "html5qr-code-full-region";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerDialogOpen, setIsScannerDialogOpen] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    getProducts();
  }, []);

  // --- ZMIANA NR 2: Zastępujemy całą logikę skanera nową, ulepszoną wersją ---
  useEffect(() => {
    if (!isScannerDialogOpen) return;

    const startScanner = () => {
      const element = document.getElementById(qrcodeRegionId);
      if (!element) return;

      // Konfiguracja skanera (bezpośrednio z dokumentacji)
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };
      
      const scanner = new Html5Qrcode(qrcodeRegionId, false);
      scannerRef.current = scanner;

      const onScanSuccess = (decodedText) => {
        setSearchTerm(decodedText);
        setIsScannerDialogOpen(false);
      };
      const onScanFailure = (error) => {};
      
      // Uruchamiamy skaner, prosząc o tylną kamerę
      scanner.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
        .catch(err => {
          // Jeśli nie ma tylnej kamery, próbuj z jakąkolwiek
          console.warn("Nie udało się znaleźć tylnego aparatu, próbuję z domyślnym:", err);
          scanner.start(undefined, config, onScanSuccess, onScanFailure)
            .catch(err => console.error("Nie udało się uruchomić skanera.", err));
        });
    };

    // Używamy setTimeout, żeby dać Reactowi czas na wyrenderowanie okna
    const timer = setTimeout(startScanner, 100);

    // Funkcja czyszcząca, zatrzymuje kamerę po zamknięciu okna
    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(error => console.error("Błąd zatrzymywania skanera.", error));
      }
    };
  }, [isScannerDialogOpen]);

  // Twoja reszta kodu pozostaje nietknięta
  async function getProducts() {
    setLoading(true);
    const { data } = await supabase.from('produkty').select('*').order('kategoria').order('podkategoria').order('nazwa');
    setProducts(data || []);
    setLoading(false);
  }

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const keywords = searchTerm.toLowerCase().split(' ').filter(Boolean);
    return products.filter(p => {
      if (String(p.id) === searchTerm) return true;
      const text = [p.nazwa, p.kategoria, p.podkategoria || ''].join(' ').toLowerCase();
      return keywords.every(k => text.includes(k));
    });
  }, [products, searchTerm]);

  const groupedProducts = useMemo(() => {
    return products.reduce((acc, p) => {
      const cat = p.kategoria;
      const sub = p.podkategoria || 'Bez podkategorii';
      if (!acc[cat]) acc[cat] = {};
      if (!acc[cat][sub]) acc[cat][sub] = [];
      acc[cat][sub].push(p);
      return acc;
    }, {});
  }, [products]);

  const renderContent = () => {
    if (loading) return <p className="text-center py-10">Ładowanie...</p>;
    if (searchTerm.trim()) {
      return (
        <div className="flex flex-col gap-2">
          {filteredProducts.length > 0 ? filteredProducts.map(p => <SearchResultItem key={p.id} product={p} />) : <p className="text-center text-muted-foreground py-10">Nie znaleziono.</p>}
        </div>
      );
    }
    return (
      <Accordion type="multiple" className="w-full">
        {Object.entries(groupedProducts).map(([cat, sub]) => (
          <AccordionItem value={`cat-${cat}`} key={cat}>
            <AccordionTrigger className="text-xl font-semibold p-4 hover:no-underline">{cat}</AccordionTrigger>
            <AccordionContent className="p-0 pl-4 border-l">
              <Accordion type="multiple" className="w-full">
                {Object.entries(sub).map(([subcat, prods]) => (
                  <AccordionItem value={`sub-${subcat}`} key={subcat}>
                    <AccordionTrigger className="text-lg font-medium p-3 hover:no-underline">{subcat}</AccordionTrigger>
                    <AccordionContent className="p-0 pl-4 border-l">
                      {prods.map(p => <ProductListItem key={p.id} product={p} />)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-2xl">Stan Magazynu</CardTitle>
          <div className="flex w-full md:w-auto gap-2">
            <Input placeholder="Szukaj..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full max-w-sm" />
            
            <Dialog open={isScannerDialogOpen} onOpenChange={setIsScannerDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  Skanuj Kod
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Skaner Kodów QR</DialogTitle>
                  <CardDescription>Umieść kod QR w ramce, aby go zeskanować.</CardDescription>
                </DialogHeader>
                <div id={qrcodeRegionId} className="w-full mt-4 rounded-lg overflow-hidden"></div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}