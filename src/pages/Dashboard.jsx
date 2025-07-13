// src/pages/Dashboard.jsx - Wersja z Płaską Listą i Szybkim Wyszukiwaniem

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/supabaseClient'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProductListItem from '@/components/ProductListItem' // Nasz komponent wiersza

const qrcodeRegionId = "html5qr-code-full-region";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stany dla skanera
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    getProducts();
  }, []);

  // UseEffect do zarządzania skanerem
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

  function onScanSuccess(decodedText) { setSearchTerm(decodedText); setIsScannerOpen(false); }
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

  // --- NOWA, PROSTA LOGIKA FILTROWANIA ---
  const filteredProducts = products.filter(product => {
    // Jeśli nie ma wyszukiwania, pokaż wszystko
    if (!searchTerm) return true;

    const searchTermLower = searchTerm.toLowerCase();
    const podkategoria = product.podkategoria || '';
    
    // Zwróć prawdę, jeśli którykolwiek warunek jest spełniony
    return (
      product.nazwa.toLowerCase().includes(searchTermLower) ||
      product.kategoria.toLowerCase().includes(searchTermLower) ||
      podkategoria.toLowerCase().includes(searchTermLower) ||
      String(product.id) === searchTerm // Kluczowe dla skanera QR
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-2xl">Aktualny Stan Magazynu</CardTitle>
          <div className="flex w-full md:w-auto gap-2">
            <Input
              placeholder="Szukaj..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm"
            />
            {/* PRZYWRÓCONY PRZYCISK SKANERA */}
            <Button variant="secondary" onClick={() => setIsScannerOpen(prev => !prev)}>
              {isScannerOpen ? "Zamknij Skaner" : "Skanuj QR"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* KONTENER DLA WIDOKU SKANERA */}
          {isScannerOpen && <div id={qrcodeRegionId} className="w-full my-4"></div>}
          
          {/* --- NOWY, PROSTY WIDOK LISTY --- */}
          <div className="flex flex-col gap-2">
            {loading ? (
              <p className="text-center py-10">Ładowanie...</p>
            ) : filteredProducts.length > 0 ? (
              // Jeśli coś wyszukujemy, pokazujemy płaską listę wyników
              // Jeśli nie, moglibyśmy pokazywać pogrupowaną listę (ale na razie upraszczamy)
              filteredProducts.map((product) => (
                <ProductListItem key={product.id} product={product} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">
                {searchTerm ? "Nie znaleziono produktów." : "Brak produktów w magazynie."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}