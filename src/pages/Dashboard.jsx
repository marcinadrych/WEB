// src/pages/Dashboard.jsx - Wersja z automatycznym otwieraniem po wyszukaniu

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
  
  // NOWY STAN: Przechowuje ID kategorii i podkategorii, które mają być otwarte
  const [openAccordionItems, setOpenAccordionItems] = useState([]);

  useEffect(() => {
    getProducts()
  }, []);

  async function getProducts() {
    setLoading(true);
    const { data } = await supabase.from('produkty').select('*').order('kategoria').order('podkategoria').order('nazwa');
    setProducts(data || []);
    setLoading(false);
  }

  const groupedAndFilteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      // ... logika filtrowania bez zmian ...
      const searchTermLower = searchTerm.toLowerCase();
      const podkategoria = product.podkategoria || '';
      return (
        product.nazwa.toLowerCase().includes(searchTermLower) ||
        product.kategoria.toLowerCase().includes(searchTermLower) ||
        podkategoria.toLowerCase().includes(searchTermLower) ||
        String(product.id) === searchTerm
      );
    });

    // --- NOWA LOGIKA AUTOMATYCZNEGO OTWIERANIA ---
    // Jeśli po przefiltrowaniu został tylko JEDEN produkt,
    // ustawiamy jego kategorię i podkategorię jako domyślnie otwarte.
    if (filtered.length === 1) {
      const singleProduct = filtered[0];
      const categoryKey = `category-${singleProduct.kategoria}`;
      const subcategoryKey = `subcategory-${singleProduct.podkategoria || 'Bez podkategorii'}`;
      setOpenAccordionItems([categoryKey, subcategoryKey]);
    } else {
      // Jeśli wyników jest więcej (lub nie ma), resetujemy stan otwartych akordeonów
      setOpenAccordionItems([]);
    }

    // Logika grupowania pozostaje bez zmian
    const grouped = filtered.reduce((acc, product) => {
      const category = product.kategoria;
      const subcategory = product.podkategoria || 'Bez podkategorii';
      if (!acc[category]) acc[category] = {};
      if (!acc[category][subcategory]) acc[category][subcategory] = [];
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
              placeholder="Szukaj produktu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm"
            />
            {/* Możemy tu w przyszłości przywrócić skaner QR */}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-10">Ładowanie...</p>
          ) : Object.keys(groupedAndFilteredProducts).length > 0 ? (
            // Przekazujemy stan otwartych elementów do głównego akordeonu
            <Accordion type="multiple" className="w-full" value={openAccordionItems} onValueChange={setOpenAccordionItems}>
              {Object.entries(groupedAndFilteredProducts).map(([category, subcategories]) => (
                <AccordionItem value={`category-${category}`} key={category}>
                  <AccordionTrigger className="text-xl font-semibold p-4 hover:no-underline">
                    {category}
                  </AccordionTrigger>
                  <AccordionContent className="p-0 pl-4 border-l">
                    {/* Przekazujemy stan także do zagnieżdżonego akordeonu */}
                    <Accordion type="multiple" className="w-full" value={openAccordionItems} onValueChange={setOpenAccordionItems}>
                      {Object.entries(subcategories).map(([subcategory, productsInCategory]) => (
                        <AccordionItem value={`subcategory-${subcategory}`} key={subcategory}>
                          <AccordionTrigger className="text-lg font-medium p-3 hover:no-underline">
                            {subcategory}
                          </AccordionTrigger>
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