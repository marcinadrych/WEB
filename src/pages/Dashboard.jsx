// src/pages/Dashboard.jsx

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/supabaseClient'
import { Link } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
        scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, { fps: 10, qrbox: { width: 250, height: 250 } }, false);
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
  function onScanFailure(error) { /* puste */ }

  async function getProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('produkty').select('*').order('nazwa');
    if (error) {
      console.error("Błąd pobierania produktów:", error);
    } else {
      setProducts(data || []);
    }
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
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Nazwa</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead className="text-right">Ilość</TableHead>
                  <TableHead className="text-center">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan="4" className="text-center h-24">Ładowanie...</TableCell></TableRow>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.nazwa}</TableCell>
                      <TableCell>{product.kategoria}</TableCell>
                      <TableCell 
                        className={`text-right font-bold text-xl ${product.ilosc < 5 ? 'text-red-500' : 'text-green-500'}`}
                      >
                        {product.ilosc} {product.jednostka}
                      </TableCell>
                      <TableCell className="text-center flex gap-2 justify-center">
                        <a href={`/qr?value=${product.id}&name=${encodeURIComponent(product.nazwa)}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">QR</Button>
                        </a>
                        <Link to={`/edytuj-produkt/${product.id}`}>
                          <Button size="sm">Edytuj</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan="4" className="text-center h-24">Nie znaleziono produktów.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}