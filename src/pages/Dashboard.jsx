// src/pages/Dashboard.jsx

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/supabaseClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProductListItem from '@/components/ProductListItem';
import SearchResultItem from '@/components/SearchResultItem';
import jsQR from "jsqr";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerDialogOpen, setIsScannerDialogOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  const beepSound = useMemo(() => {
    if (typeof Audio !== "undefined") {
      return new Audio('/bip.mp3');
    }
    return null;
  }, []);

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    if (!isScannerDialogOpen) {
      return;
    }

    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", true);
          await videoRef.current.play();
          
          animationRef.current = requestAnimationFrame(scanTick);
        }
      } catch (err) {
        console.error("Błąd dostępu do kamery:", err);
        setIsScannerDialogOpen(false); 
      }
    };

    startScanner();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScannerDialogOpen]);


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

  // --- TO JEST JEDYNA ZMIENIONA SEKCJA W CAŁYM PLIKU ---
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) return []; 

    // Sprawdzamy, czy wyszukiwana fraza składa się wyłącznie z cyfr
    const isNumeric = /^\d+$/.test(term);
    
    return products.filter(product => {
      // Jeśli szukamy po liczbie (z kodu QR), filtruj TYLKO po ID
      if (isNumeric) {
        return String(product.id) === term;
      } 
      
      // W przeciwnym wypadku, rób inteligentne wyszukiwanie tekstowe
      else {
        const searchKeywords = term.toLowerCase().split(' ').filter(Boolean);
        return searchKeywords.every(keyword => {
          const productText = [
            product.nazwa,
            product.kategoria,
            product.podkategoria || ''
          ].join(' ').toLowerCase();
          return productText.includes(keyword);
        });
      }
    });
  }, [products, searchTerm]);
  // --- KONIEC ZMIAN ---

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

  const scanTick = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanTick);
      return;
    }
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);
    if (code) {
      if (beepSound) beepSound.play();
      setSearchTerm(code.data);
      stopScanner();
    } else {
      animationRef.current = requestAnimationFrame(scanTick);
    }
  };
  
  const stopScanner = () => {
    setIsScannerDialogOpen(false);
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
            <Button variant="secondary" onClick={() => setIsScannerDialogOpen(true)}>Skanuj Kod</Button>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
      <Dialog open={isScannerDialogOpen} onOpenChange={setIsScannerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Skaner Kodów QR</DialogTitle>
            <CardDescription>Umieść kod QR w zasięgu kamery.</CardDescription>
          </DialogHeader>
          <div className="w-full aspect-square bg-black rounded overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" />
          </div>
          <Button variant="outline" onClick={stopScanner} className="mt-4 w-full">Anuluj</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}