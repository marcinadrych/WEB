import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/supabaseClient';
import QRCode from 'qrcode'; // Importujemy nową bibliotekę
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    if (isScannerOpen) {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        }, false);
      }
      scannerRef.current.render(onScanSuccess, onScanFailure);
    } else {
      if (scannerRef.current && scannerRef.current.getState() === 2) {
        scannerRef.current.clear().catch(error => console.error("Błąd czyszczenia skanera.", error));
      }
    }

    return () => {
      if (scannerRef.current && scannerRef.current.getState() === 2) {
        scannerRef.current.clear().catch(error => console.error("Błąd czyszczenia skanera przy odmontowaniu.", error));
      }
    };
  }, [isScannerOpen]);

  function onScanSuccess(decodedText) {
    setSearchTerm(decodedText);
    setIsScannerOpen(false);
  }

  function onScanFailure(error) {
    // można logować lub zignorować
  }

  async function getProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('produkty')
      .select('*')
      .order('nazwa', { ascending: true });
    setProducts(data || []);
    setLoading(false);
  }

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

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-3xl">Aktualny Stan Magazynu</CardTitle>
          <div className="flex w-full md:w-auto gap-2">
            <Input
              placeholder="Szukaj..."
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

          {loading ? (
            <p className="text-center py-10">Ładowanie...</p>
          ) : filteredProducts.length > 0 ? (
            <Accordion type="single" collapsible className="w-full border rounded-lg">
              {filteredProducts.map((product) => (
                <AccordionItem value={`item-${product.id}`} key={product.id} className="border-b last:border-b-0">
                  <AccordionTrigger className="hover:no-underline p-4 text-lg">
                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium text-left">{product.nazwa}</span>
                      <span className={`font-bold text-2xl ${product.ilosc < 5 ? 'text-red-500' : 'text-green-500'}`}>
                        {product.ilosc} {product.jednostka}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-4 p-4 border-t bg-muted/50 text-base">
                      <div className="grid grid-cols-2 gap-4">
                        <div><strong>Kategoria:</strong><br />{product.kategoria}</div>
                        <div><strong>Podkategoria:</strong><br />{product.podkategoria || '---'}</div>
                      </div>
                      {product.uwagi && (
                        <div>
                          <strong>Uwagi:</strong>
                          <p className="text-muted-foreground whitespace-pre-wrap">{product.uwagi}</p>
                        </div>
                      )}
                      <div className="flex gap-2 justify-end pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Pokaż QR</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Kod QR dla: {product.nazwa}</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center justify-center p-6">
                              <QRCode value={String(product.id)} size={256} level="H" includeMargin />
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Link to={`/edytuj-produkt/${product.id}`}>
                          <Button size="sm">Edytuj</Button>
                        </Link>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-10">Nie znaleziono produktów.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
