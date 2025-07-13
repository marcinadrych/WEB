// src/pages/Dashboard.jsx - Wersja z inteligentnym otwieraniem

import { useState, useEffect } from 'react'
import { supabase } from '@/supabaseClient'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion } from "@/components/ui/accordion"
import ProductListItem from '@/components/ProductListItem'
// Musimy przywrócić te importy, bo Dashboard znowu ich używa
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from '@/components/ui/button' // Na wszelki wypadek

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // NOWY/PRZYWRÓCONY STAN
  const [openAccordionItems, setOpenAccordionItems] = useState([]);

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

  // Filtrowanie i grupowanie
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

  // Ten useEffect będzie reagował na zmianę w wyszukiwaniu
  useEffect(() => {
    // Jeśli wyszukiwanie jest aktywne i został tylko 1 produkt
    if (searchTerm && filteredProducts.length === 1) {
      const singleProduct = filteredProducts[0];
      const categoryKey = `category-${singleProduct.kategoria}`;
      const subcategoryKey = `subcategory-${singleProduct.podkategoria || 'Bez podkategorii'}`;
      // Ustawiamy, które akordeony mają być otwarte
      setOpenAccordionItems([categoryKey, subcategoryKey]);
    } else {
      // W każdym innym przypadku, wszystkie akordeony są zwinięte
      setOpenAccordionItems([]);
    }
  }, [searchTerm, products]); // Uruchom ponownie, gdy zmieni się wyszukiwanie lub lista produktów


  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-2xl">Aktualny Stan Magazynu</CardTitle>
          <div className="w-full max-w-sm">
            <Input
              placeholder="Szukaj..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-10">Ładowanie...</p>
          ) : Object.keys(groupedProducts).length > 0 ? (
            // Przekazujemy stan do komponentów Akordeonu
            <Accordion type="multiple" className="w-full" value={openAccordionItems} onValueChange={setOpenAccordionItems}>
              {Object.entries(groupedProducts).map(([category, subcategories]) => (
                <AccordionItem value={`category-${category}`} key={category}>
                  <AccordionTrigger className="text-xl font-semibold p-4 hover:no-underline">
                    {category}
                  </AccordionTrigger>
                  <AccordionContent className="p-0 pl-4 border-l">
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