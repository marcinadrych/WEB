// src/pages/ZmienStan.jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCombobox from '@/components/ProductCombobox'; // <<< NOWY IMPORT

// Komponent formularza wyniesiony na zewnątrz, żeby naprawić błąd z focusem
function FormContent({ products, loading, operationType, onSubmit }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      selectedProductId,
      quantity: parseFloat(quantity),
      notes,
      operationType,
    });
  };

  return (
    <Card>
      <CardHeader><CardTitle>{operationType === 'zuzycie' ? 'Rejestrowanie zużycia' : 'Rejestrowanie dostawy'}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="product">Produkt</Label>
            <ProductCombobox
              products={products}
              value={selectedProductId}
              onSelect={setSelectedProductId}
              placeholder="Wyszukaj i wybierz produkt..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Ilość</Label>
            <Input id="quantity" type="number" min="0.01" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Uwagi (np. do zlecenia)</Label>
            <Input id="notes" type="text" placeholder="np. Remont łazienki..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Zapisywanie...' : `Zatwierdź`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ZmienStan() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [operationType, setOperationType] = useState('zuzycie');
  const { toast } = useToast();

  useEffect(() => {
    async function getProducts() {
      const { data } = await supabase.from('produkty').select('id, nazwa, ilosc, jednostka').order('nazwa');
      setProducts(data || []);
      setLoading(false);
    }
    getProducts();
  }, []);

  async function handleFormSubmit(formData) {
    const { selectedProductId, quantity, notes, operationType } = formData;
    if (!selectedProductId || isNaN(quantity) || quantity <= 0) {
      toast({ title: "Błąd walidacji", description: "Wybierz produkt i podaj poprawną ilość.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // ... cała logika zapisu do bazy bez zmian
      window.location.href = '/'; // Twarde odświeżenie dla pewności
    } catch (error) {
      toast({ title: "Błąd serwera", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Zmień Stan Magazynowy</h1>
      <Tabs value={operationType} onValueChange={setOperationType} className="w-full md:max-w-xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="zuzycie">Odejmij ze Stanu (Zużycie)</TabsTrigger>
          <TabsTrigger value="przyjecie">Dodaj do Stanu (Dostawa)</TabsTrigger>
        </TabsList>
        <TabsContent value="zuzycie">
          <FormContent products={products} loading={loading} operationType="zuzycie" onSubmit={handleFormSubmit} />
        </TabsContent>
        <TabsContent value="przyjecie">
          <FormContent products={products} loading={loading} operationType="przyjecie" onSubmit={handleFormSubmit} />
        </TabsContent>
      </Tabs>
    </div>
  );
}