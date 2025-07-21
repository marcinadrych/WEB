// src/pages/Dashboard.jsx

import { useState, useRef } from 'react'; // <<< ZMIANA NR 1: Usuwamy niepotrzebne importy
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProductListItem from '@/components/ProductListItem';
import SearchResultItem from '@/components/SearchResultItem';
import { useProducts } from '@/hooks/useProducts';
import { useQuickUpdate } from '@/hooks/useQuickUpdate';
// --- ZMIANA NR 2: Importujemy nowy hook do skanera ---
import { useQrScanner } from '@/hooks/useQrScanner';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { loading, getProducts, filterAndGroup } = useProducts();
  const { promptForQuantity, QuantityDialog, ConfirmationDialog } = useQuickUpdate(getProducts);
  // --- ZMIANA NR 3: Używamy nowego hooka ---
  const { openScanner, ScannerDialog } = useQrScanner(setSearchTerm); 
  
  const { grouped, filtered } = filterAndGroup(searchTerm);

  const renderContent = () => {
    if (loading) return <p className="text-center py-10">Ładowanie...</p>;
    if (searchTerm.trim()) {
      return (
        <div className="flex flex-col gap-2">
          {filtered.length > 0 ? filtered.map(p => <SearchResultItem key={p.id} product={p} onQuickUpdate={promptForQuantity} />) : <p className="text-center text-muted-foreground py-10">Nie znaleziono</p>}
        </div>
      );
    }
    return (
      <Accordion type="multiple" className="w-full">
        {Object.entries(grouped).map(([cat, sub]) => (
          <AccordionItem value={`cat-${cat}`} key={cat}>
            <AccordionTrigger className="text-xl font-semibold p-4 hover:no-underline">{cat}</AccordionTrigger>
            <AccordionContent className="p-0 pl-4 border-l">
              <Accordion type="multiple" className="w-full">
                {Object.entries(sub).map(([subcat, dims]) => (
                  <AccordionItem value={`sub-${subcat}`} key={subcat}>
                    <AccordionTrigger className="text-lg font-medium p-3 hover:no-underline">{subcat}</AccordionTrigger>
                    <AccordionContent className="p-0 pl-4 border-l">
                      <Accordion type="multiple" className="w-full">
                        {Object.entries(dims).map(([dim, prods]) => (
                          <AccordionItem value={`dim-${dim}`} key={dim}>
                            <AccordionTrigger className="font-normal p-2 hover:no-underline">{dim}</AccordionTrigger>
                            <AccordionContent className="p-0 pl-4 border-l">
                              {prods.map(p => <ProductListItem key={p.id} product={p} onQuickUpdate={promptForQuantity} />)}
                            </AccordionContent>
                          </AccordionItem>
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
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle className="text-2xl">Stan Magazynu</CardTitle>
          <div className="flex w-full md:w-auto gap-2">
            <Input
              placeholder="Szukaj..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm"
            />
            {/* --- ZMIANA NR 4: Dodajemy przycisk skanera --- */}
            <Button variant="secondary" onClick={openScanner}>Skanuj Kod</Button>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
      
      {/* --- ZMIANA NR 5: Renderujemy okna dialogowe z naszych hooków --- */}
      {ScannerDialog}
      {QuantityDialog}
      {ConfirmationDialog}
    </div>
  );
}