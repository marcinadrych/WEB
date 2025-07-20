// src/pages/ListaZakupow.jsx

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const NISKI_STAN = 5;

export default function ListaZakupow() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customItems, setCustomItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [checkedItems, setCheckedItems] = useState(new Set()); // Ten stan teraz obsłuży obie listy
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: productsData } = await supabase.from('produkty').select('*').order('nazwa');
    setProducts(productsData || []);
    const { data: customItemsData } = await supabase.from('lista_zakupow_niestandardowa').select('*').order('created_at');
    setCustomItems(customItemsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const shoppingList = useMemo(() => {
    return products.filter(p => p.ilosc < NISKI_STAN);
  }, [products]);

  const handleAddCustomItem = async (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      const { error } = await supabase.from('lista_zakupow_niestandardowa').insert({ nazwa: newItem.trim() });
      if (error) {
        toast({ title: "Błąd", description: "Nie udało się dodać pozycji.", variant: "destructive" });
      } else {
        setNewItem('');
        fetchData();
      }
    }
  };

  const handleRemoveCustomItem = async (itemId) => {
    await supabase.from('lista_zakupow_niestandardowa').delete().eq('id', itemId);
    fetchData();
  };

  // Zaznaczanie "kupione" w bazie dla listy niestandardowej
  const handleToggleCustomItem = async (item) => {
    await supabase.from('lista_zakupow_niestandardowa').update({ kupione: !item.kupione }).eq('id', item.id);
    fetchData();
  };

  // Zaznaczanie tylko wizualne dla listy z magazynu
  const handleToggleShoppingListItem = (productId) => {
    setCheckedItems(prev => {
      const newChecked = new Set(prev);
      const key = `product-${productId}`;
      if (newChecked.has(key)) {
        newChecked.delete(key);
      } else {
        newChecked.add(key);
      }
      return newChecked;
    });
  };

  if (loading) {
    return <p className="text-center py-10">Ładowanie...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Lista Zakupowa</h1>
      <Card>
        <CardHeader>
          <CardTitle>Z Magazynu (stan poniżej {NISKI_STAN})</CardTitle>
          <CardDescription>Generowane automatycznie. Odhaczenie jest tylko tymczasowe.</CardDescription>
        </CardHeader>
        <CardContent>
          {shoppingList.length > 0 ? (
            <div className="space-y-4">
              {/* --- PRZYWRÓCONE CHECKBOXY TUTAJ --- */}
              {shoppingList.map(product => {
                const isChecked = checkedItems.has(`product-${product.id}`);
                return (
                  <div key={`product-${product.id}`} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                    <Checkbox
                      id={`product-item-${product.id}`}
                      checked={isChecked}
                      onCheckedChange={() => handleToggleShoppingListItem(product.id)}
                    />
                    <Label
                      htmlFor={`product-item-${product.id}`}
                      className={`flex-1 text-lg ${isChecked ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {product.nazwa} {product.wymiar || ''}
                      <span className="ml-2 font-semibold text-red-500"> (Zostało: {product.ilosc} {product.jednostka})</span>
                    </Label>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-muted-foreground">Brak produktów do uzupełnienia.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dodatkowe Rzeczy (Wspólna Lista)</CardTitle>
          <CardDescription>Zmiany na tej liście są zapisywane dla wszystkich.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {customItems.length > 0 ? customItems.map(item => (
              <div key={item.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                <Checkbox id={`custom-item-${item.id}`} checked={item.kupione} onCheckedChange={() => handleToggleCustomItem(item)} />
                <Label htmlFor={`custom-item-${item.id}`} className={`flex-1 text-lg ${item.kupione ? 'line-through text-muted-foreground' : ''}`}>
                  {item.nazwa}
                </Label>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveCustomItem(item.id)} className="h-8 w-8">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            )) : <p className="text-sm text-muted-foreground">Lista jest pusta.</p>}
          </div>
          <form onSubmit={handleAddCustomItem} className="flex gap-2">
            <Input placeholder="Wpisz co jeszcze trzeba kupić..." value={newItem} onChange={(e) => setNewItem(e.target.value)} />
            <Button type="submit">Dodaj</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}