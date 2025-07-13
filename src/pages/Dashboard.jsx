// src/pages/Dashboard.jsx - Ostateczna wersja z dwoma widokami

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/supabaseClient'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ProductListItem from '@/components/ProductListItem' // Do widoku pogrupowanego
import SearchResultItem from '@/components/SearchResultItem' // Do widoku wyszukiwania

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function getProducts() {
      setLoading(true);
      const { data } = await supabase.from('produkty').select('*').order('kategoria').order('podkategoria').order('nazwa');
      setProducts(data || []);
      setLoading(false);
    }
    getProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(product => {
      const searchTermLower = searchTerm.toLowerCase();
      const podkategoria = product.podkategoria || '';
      return (
        product.nazwa.toLowerCase().includes(searchTermLower) ||
        product.kategoria.toLowerCase().includes(searchTermLower) ||
        podkategoria.toLowerCase().includes(searchTermLower) ||
        String(product.id) === searchTerm
      );
    });
  }, [products, searchTerm]);

  const groupedProducts = useMemo(() => {
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
    if (loading) {
      return <p className="text-center py-10">Ładowanie...</p>;
    }

    if (searchTerm) {
      return (
        <div className="flex flex-col gap-2">
          {filteredProducts.length > 0 ? (
            // Używamy nowego, prostego komponentu do wyników wyszukiwania
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
          <div className="w-full max-w-sm">
            <Input
              placeholder="Szukaj..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}