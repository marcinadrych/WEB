import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

const NISKI_STAN = 5;

export default function ListaZakupow() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [customItems, setCustomItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    async function getProducts() {
      setLoading(true);
      const { data, error } = await supabase.from('produkty').select('*').order('nazwa');
      if (error) {
        console.error("Błąd pobierania produktów:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }
    getProducts();
  }, []);

  const shoppingList = useMemo(() => {
    return products.filter(p => p.ilosc < NISKI_STAN);
  }, [products]);

  const handleCheckItem = (productId) => {
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

  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      setCustomItems([...customItems, { id: Date.now(), name: newItem.trim() }]);
      setNewItem('');
    }
  };

  const handleRemoveCustomItem = (itemId) => {
    setCustomItems(customItems.filter(item => item.id !== itemId));
    setCheckedItems(prev => {
      const newChecked = new Set(prev);
      newChecked.delete(`custom-${itemId}`);
      return newChecked;
    });
  };

  const handleCheckCustomItem = (itemId) => {
    setCheckedItems(prev => {
      const newChecked = new Set(prev);
      const key = `custom-${itemId}`;
      if (newChecked.has(key)) {
        newChecked.delete(key);
      } else {
        newChecked.add(key);
      }
      return newChecked;
    });
  };

  if (loading) {
    return <p className="text-center py-10">Ładowanie listy zakupowej...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Lista Zakupowa</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Produkty z magazynu do uzupełnienia</CardTitle>
          <CardDescription>
            Stan niższy niż {NISKI_STAN}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shoppingList.length > 0 ? (
            <div className="space-y-4">
              {shoppingList.map(product => {
                const isChecked = checkedItems.has(`product-${product.id}`);
                return (
                  <div key={`product-${product.id}`} className="flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-muted/50">
                    <Checkbox
                      id={`item-${product.id}`}
                      checked={isChecked}
                      onCheckedChange={() => handleCheckItem(product.id)}
                    />
                    <Label
                      htmlFor={`item-${product.id}`}
                      className={`flex-grow text-lg transition-colors ${isChecked ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {product.nazwa} {product.wymiar || ''}
                    </Label>
                    <span className="font-semibold text-red-500">
                      Zostało: {product.ilosc} {product.jednostka}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">Wszystkie stany magazynowe są w porządku.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dodatkowe rzeczy do kupienia</CardTitle>
        </CardHeader>
        <CardContent>
          {customItems.length > 0 && (
            <div className="space-y-4 mb-6">
              {customItems.map(item => {
                const isChecked = checkedItems.has(`custom-${item.id}`);
                return (
                  <div key={`custom-${item.id}`} className="flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-muted/50">
                    <Checkbox
                      id={`custom-item-${item.id}`}
                      checked={isChecked}
                      onCheckedChange={() => handleCheckCustomItem(item.id)}
                    />
                    <Label
                      htmlFor={`custom-item-${item.id}`}
                      className={`flex-grow text-lg transition-colors ${isChecked ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {item.name}
                    </Label>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCustomItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          <form onSubmit={handleAddCustomItem} className="flex gap-2">
            <Input
              placeholder="Wpisz co jeszcze trzeba kupić..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
            <Button type="submit">Dodaj</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}