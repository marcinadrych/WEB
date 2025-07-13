import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/supabaseClient'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ProductListItem from '@/components/ProductListItem'

const qrcodeRegionId = "html5qr-code-full-region";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Skaner zostawiamy, on działa
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const scannerRef = useRef(null);
  useEffect(() => {
    if (isScannerOpen) { if (!scannerRef.current) { scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, { fps: 10, qrbox: { width: 250, height: 250 } }, false); } scannerRef.current.render(onScanSuccess, onScanFailure); } else { if (scannerRef.current && scannerRef.current.getState() === 2) { scannerRef.current.clear().catch(error => {}); } } return () => { if (scannerRef.current && scannerRef.current.getState() === 2) { scannerRef.current.clear().catch(error => {}); } };
  }, [isScannerOpen]);
  function onScanSuccess(decodedText) { setSearchTerm(decodedText); setIsScannerOpen(false); }
  function onScanFailure(error) {}

  // Pobieranie danych - proste i niezawodne
  useEffect(() => {
    async function getProducts() {
      setLoading(true);
      const { data, error } = await supabase.from('produkty').select('*').order('kategoria').order('podkategoria').order('nazwa');
      if (error) {
        console.error("Błąd pobierania produktów:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }
    getProducts();
  }, []);
  
  // --- NOWA, PROSTSZA LOGIKA FILTROWANIA I GRUPOWANIA ---
  // Odbywa się przy każdym renderze, co jest bardziej "wybaczające"

  const filteredProducts = products.filter(product => {
    const searchTermLower = searchTerm.toLowerCase();
    const podkategoria = product.podkategoria || '';
    return (
      product.nazwa.toLowerCase().includes(searchTermLower) ||
      product.kategoria.toLowerCase().includes(searchTermLower) ||
      podkategoria.toLowerCase().includes(searchTermLower) ||
      String(product.id) === searchTerm
    );
  });

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = product.kategoria;
    const subcategory = product.podkategoria || 'Bez podkategorii';
    if (!acc[category]) acc[category] = {};
    if (!acc[category][subcategory]) acc[category][subcategory] = [];
    acc[category][subcategory].push(product);
    return acc;
  }, {});


  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-2xl">Aktualny Stan Magazynu</CardTitle>
          <div className="flex w-full md:w-auto gap-2">
            <Input placeholder="Szukaj..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full max-w-sm" />
            <Button variant="secondary" onClick={() => setIsScannerOpen(prev => !prev)}>{isScannerOpen ? "Zamknij Skaner" : "Skanuj QR"}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isScannerOpen && <div id={qrcodeRegionId} className="w-full my-4"></div>}
          
          {loading ? (
            <p className="text-center py-10">Ładowanie...</p>
          ) : Object.keys(groupedProducts).length > 0 ? (
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
                            <Accordion type="single" collapsible className="w-full">
                              {productsInCategory.map((product) => (
                                <ProductListItem key={product.id} product={product} />
                              ))}
                            </Accordion>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-10">
              {searchTerm ? "Nie znaleziono produktów." : "Brak produktów w magazynie."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}