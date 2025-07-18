// src/pages/Dashboard.jsx

import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '@/supabaseClient'
// --- ZMIANA NR 1: Upewniamy się, że importujemy Html5Qrcode ---
import { Html5Qrcode } from 'html5-qrcode'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
// --- ZMIANA NR 2: Usuwamy DialogTrigger, bo nie będzie potrzebny ---
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  
  // --- ZMIANA NR 3: Usuniemy stary, błędny useEffect i zastąpimy go funkcjami ---

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

  // --- ZMIANA NR 4: Nowe, niezawodne funkcje do ręcznego sterowania skanerem ---
  const startScanner = () => {
    setIsScannerDialogOpen(true); // Otwórz okno
    // Czekamy chwilę, żeby okno się wyrenderowało
    setTimeout(async () => {
      try {
        // Ta linia sama poprosi o dostęp do kamery
        await Html5Qrcode.getCameras();
        const scanner = new Html5Qrcode(qrcodeRegionId, false);
        scannerRef.current = scanner;
        const onScanSuccess = (decodedText) => {
          setSearchTerm(decodedText);
          stopScanner(); // Zatrzymaj i zamknij po sukcesie
        };
        const onScanFailure = (error) => {};
        scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanFailure)
          .catch(() => scanner.start(undefined, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanFailure));
      } catch (err) {
        console.error("Błąd inicjalizacji skanera:", err);
        setIsScannerDialogOpen(false); // Zamknij okno, jeśli użytkownik nie da dostępu
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .then(() => setIsScannerDialogOpen(false))
        .catch(err => {
          console.error("Błąd zatrzymywania skanera:", err);
          setIsScannerDialogOpen(false);
        });
    } else {
      setIsScannerDialogOpen(false);
    }
  };


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
            
            {/* --- ZMIANA NR 5: Przycisk wywołuje naszą nową funkcję, a nie DialogTrigger --- */}
            <Button variant="secondary" onClick={startScanner}>
              Skanuj Kod
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
      
      {/* --- ZMIANA NR 6: Dialog jest teraz w pełni kontrolowany przez nasz kod --- */}
      <Dialog open={isScannerDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) stopScanner(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Skaner Kodów QR</DialogTitle>
            <CardDescription>Umieść kod QR w ramce.</CardDescription>
          </DialogHeader>
          <div id={qrcodeRegionId} className="w-full mt-4 rounded-lg overflow-hidden"></div>
          <Button variant="outline" onClick={stopScanner} className="mt-4">Anuluj</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}