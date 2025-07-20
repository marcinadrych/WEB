// src/pages/Dashboard.jsx

import { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProductListItem from '@/components/ProductListItem';
import SearchResultItem from '@/components/SearchResultItem';
import { useProducts } from '@/hooks/useProducts';
import { useQuickUpdate } from '@/hooks/useQuickUpdate';
// Skaner na razie pominiemy, żeby było jeszcze prościej. Możemy go dodać jako trzeci hook.

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { loading, getProducts, filterAndGroup } = useProducts();
  const { promptForQuantity, QuantityDialog, ConfirmationDialog } = useQuickUpdate(getProducts);
  const { grouped, filtered } = filterAndGroup(searchTerm);

  const renderContent = () => {
    if (loading) return <p className="text-center py-10">Ładowanie...</p>;
    if (searchTerm.trim()) {
      return (
        <div className="flex flex-col gap-2">
          {filtered.map(p => <SearchResultItem key={p.id} product={p} onQuickUpdate={promptForQuantity} />)}
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
            {/* Tutaj można dodać przycisk skanera z jego własnego hooka */}
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
      
      {QuantityDialog}
      {ConfirmationDialog}
    </div>
  );
}