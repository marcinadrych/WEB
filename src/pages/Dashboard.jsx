import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/supabaseClient';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion } from "@/components/ui/accordion";
import ProductListItem from '@/components/ProductListItem';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Ten useEffect jest jedynym miejscem, gdzie pobieramy dane.
  useEffect(() => {
    async function getProducts() {
      setLoading(true);

      // Pobieramy dane z tabeli 'produkty'.
      // RLS (reguła SELECT z warunkiem 'true') powinna na to pozwolić.
      let { data, error } = await supabase
        .from('produkty')
        .select('*')
        .order('kategoria')
        .order('nazwa');

      if (error) {
        console.error("Błąd pobierania produktów z Supabase:", error);
        // Jeśli jest błąd, ustawiamy pustą tablicę, żeby aplikacja się nie wysypała.
        setProducts([]); 
      } else {
        // Jeśli wszystko jest OK, ustawiamy pobrane dane.
        setProducts(data || []);
      }
      setLoading(false);
    }

    getProducts();
  }, []); // Pusta tablica oznacza, że funkcja wykona się tylko raz, po załadowaniu komponentu.

  // Logika grupowania i filtrowania pozostaje bez zmian.
  const groupedAndFilteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const searchTermLower = searchTerm.toLowerCase();
      return product.nazwa.toLowerCase().includes(searchTermLower);
    });

    const grouped = filtered.reduce((acc, product) => {
      const category = product.kategoria;
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {});

    return grouped;
  }, [products, searchTerm]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Aktualny Stan Magazynu</CardTitle>
          <Input
            placeholder="Szukaj..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-10">Ładowanie...</p>
          ) : Object.keys(groupedAndFilteredProducts).length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedAndFilteredProducts).map(([category, productsInCategory]) => (
                <AccordionItem value={`category-${category}`} key={category}>
                  <AccordionTrigger className="text-xl font-semibold p-4">
                    {category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2 p-2">
                      {productsInCategory.map((product) => (
                        <ProductListItem key={product.id} product={product} />
                      ))}
                    </div>
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
  );
}