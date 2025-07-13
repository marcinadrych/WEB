import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '@/supabaseClient'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ProductListItem from '@/components/ProductListItem'
import SearchResultItem from '@/components/SearchResultItem' // Będziemy go potrzebować

const qrcodeRegionId = "html5qr-code-full-region";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    // Logika skanera pozostaje bez zmian
    if (isScannerOpen) { if (!scannerRef.current) { scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, { fps: 10, qrbox: { width: 250, height: 250 } }, false); } scannerRef.current.render(onScanSuccess, onScanFailure); } else { if (scannerRef.current && scannerRef.current.getState() === 2) { scannerRef.current.clear().catch(e => {}); } } return () => { if (scannerRef.current && scannerRef.current.getState() === 2) { scannerRef.current.clear().catch(e => {}); } };
  }, [isScannerOpen]);

  function onScanSuccess(decodedText) { setSearchTerm(decodedText); setIsScannerOpen(false); }
  function onScanFailure(error) {}

  async function getProducts() {
    setLoading(true);
    const { data } = await supabase.from('produkty').select('*').order('kategoria').order('podkategoria').order('nazwa');
    setProducts(data || []);
    setLoading(false);
  }

  // Uproszczona i bardziej niezawodna logika
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
            <Button variant="secondary" onClick={() => setIsScannerOpen(p => !p)}>{isScannerOpen ? "Zamknij Skaner" : "Skanuj QR"}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isScannerOpen && <div id={qrcodeRegionId} className="w-full my-4" />}
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}