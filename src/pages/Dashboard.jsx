import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '@/supabaseClient'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ProductListItem from '@/components/ProductListItem'
import SearchResultItem from '@/components/SearchResultItem'

const qrcodeRegionId = "html5qr-code-full-region";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    async function getProducts() {
      setLoading(true);
      const { data } = await supabase.from('produkty').select('*').order('kategoria').order('podkategoria').order('nazwa');
      setProducts(data || []);
      setLoading(false);
    }
    getProducts();
  }, []);

  useEffect(() => {
    if (isScannerOpen) {
      if (!scannerRef.current) { scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, { fps: 10, qrbox: { width: 250, height: 250 } }, false); }
      scannerRef.current.render(onScanSuccess, onScanFailure);
    } else {
      if (scannerRef.current && scannerRef.current.getState() === 2) { scannerRef.current.clear().catch(error => console.error("Błąd czyszczenia skanera.", error)); }
    }
    return () => { if (scannerRef.current && scannerRef.current.getState() === 2) { scannerRef.current.clear().catch(error => console.error("Błąd czyszczenia skanera.", error)); } };
  }, [isScannerOpen]);

  function onScanSuccess(decodedText) { setSearchTerm(decodedText); setIsScannerOpen(false); }
  function onScanFailure(error) {}

  // --- POPRAWIONA I KOMPLETNA LOGIKA FILTROWANIA ---
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const searchKeywords = searchTerm.toLowerCase().split(' ').filter(Boolean);

    return products.filter(product => {
      // Sprawdzamy, czy wyszukiwana fraza to DOKŁADNIE ID produktu (ze skanera)
      if (String(product.id) === searchTerm) {
        return true;
      }
      
      // Jeśli nie, robimy inteligentne wyszukiwanie tekstowe
      const productText = [
        product.nazwa,
        product.kategoria,
        product.podkategoria || ''
      ].join(' ').toLowerCase();
      
      return searchKeywords.every(keyword => productText.includes(keyword));
    });
  }, [products, searchTerm]);


  const groupedProducts = useMemo(() => {
    // Ta logika pozostaje bez zmian
    return products.reduce((acc, product) => {
      const category = product.kategoria;
      const subcategory = product.podkategoria || 'Bez podkategorii';
      if (!acc[category]) acc[category] = {};
      if (!acc[category][subcategory]) acc[category][subcategory] = [];
      acc[category][subcategory].push(product);
      return acc;
    }, {});
  }, [products]);

  const renderContent = () => {
    if (loading) return <p className="text-center py-10">Ładowanie...</p>;

    if (searchTerm.trim()) {
      return (
        <div className="flex flex-col gap-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => <SearchResultItem key={product.id} product={product} />)
          ) : (
            <p className="text-center text-muted-foreground py-10">Nie znaleziono produktów.</p>
          )}
        </div>
      );
    }

    return (
      <Accordion type="multiple" className="w-full">
        {Object.entries(groupedProducts).map(([category, subcategories]) => (
          <AccordionItem value={`category-${category}`} key={category}>
            <AccordionTrigger className="text-xl font-semibold p-4 hover:no-underline">{category}</AccordionTrigger>
            <AccordionContent className="p-0 pl-4 border-l">
              <Accordion type="multiple" className="w-full">
                {Object.entries(subcategories).map(([subcategory, productsInCategory]) => (
                  <AccordionItem value={`subcategory-${subcategory}`} key={subcategory}>
                    <AccordionTrigger className="text-lg font-medium p-3 hover:no-underline">{subcategory}</AccordionTrigger>
                    <AccordionContent className="p-0 pl-4 border-l">
                      {productsInCategory.map((product) => (
                        <ProductListItem key={product.id} product={product} />
                      ))}
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
          <CardTitle className="text-2xl">Aktualny Stan Magazynu</CardTitle>
          <div className="flex w-full md:w-auto gap-2">
            <Input
              placeholder="Szukaj lub skanuj..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm"
            />
            <Button variant="secondary" onClick={() => setIsScannerOpen(prev => !prev)}>
              {isScannerOpen ? "Zamknij Skaner" : "Skanuj QR"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isScannerOpen && <div id={qrcodeRegionId} className="w-full my-4"></div>}
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}