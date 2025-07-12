// src/pages/Dashboard.jsx - Wersja z grupowaniem po KATEGORIACH i PODKATEGORIACH

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/supabaseClient'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion } from "@/components/ui/accordion"
import ProductListItem from '@/components/ProductListItem'

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getProducts()
  }, []);

  async function getProducts() {
    setLoading(true);
    // Sortujemy po kategorii, potem podkategorii, potem nazwie
    const { data, error } = await supabase.from('produkty').select('*').order('kategoria').order('podkategoria').order('nazwa');
    if (error) {
      console.error("Błąd pobierania produktów:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  // Używamy useMemo do zaawansowanego filtrowania i grupowania
  const groupedAndFilteredProducts = useMemo(() => {
    // 1. Filtrujemy produkty
    const filtered = products.filter(product => {
      const searchTermLower = searchTerm.toLowerCase();
      const podkategoria = product.podkategoria || '';
      return (
        product.nazwa.toLowerCase().includes(searchTermLower) ||
        product.kategoria.toLowerCase().includes(searchTermLower) ||
        podkategoria.toLowerCase().includes(searchTermLower) ||
        String(product.id) === searchTerm
      );
    });

    // 2. Grupujemy dwupoziomowo
    const grouped = filtered.reduce((acc, product) => {
      const category = product.kategoria;
      // Używamy 'Bez podkategorii' jako klucza, jeśli podkategoria jest pusta
      const subcategory = product.podkategoria || 'Bez podkategorii'; 
      
      // Inicjalizujemy kategorię, jeśli nie istnieje
      if (!acc[category]) {
        acc[category] = {};
      }
      // Inicjalizujemy podkategorię wewnątrz kategorii, jeśli nie istnieje
      if (!acc[category][subcategory]) {
        acc[category][subcategory] = [];
      }
      
      acc[category][subcategory].push(product);
      return acc;
    }, {});

    return grouped;
  }, [products, searchTerm]);

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
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-10">Ładowanie...</p>
          ) : Object.keys(groupedAndFilteredProducts).length > 0 ? (
            // Poziom 1: Akordeon dla KATEGORII
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedAndFilteredProducts).map(([category, subcategories]) => (
                <AccordionItem value={`category-${category}`} key={category}>
                  <AccordionTrigger className="text-xl font-semibold p-4 hover:no-underline">
                    {category}
                  </AccordionTrigger>
                  <AccordionContent className="p-0 pl-4 border-l">
                    {/* Poziom 2: Akordeon dla PODKATEGORII */}
                    <Accordion type="multiple" className="w-full">
                      {Object.entries(subcategories).map(([subcategory, productsInCategory]) => (
                        <AccordionItem value={`subcategory-${subcategory}`} key={subcategory}>
                          <AccordionTrigger className="text-lg font-medium p-3 hover:no-underline">
                            {subcategory}
                          </AccordionTrigger>
                          <AccordionContent className="p-0 pl-4 border-l">
                            {/* Poziom 3: Akordeon dla PRODUKTÓW */}
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