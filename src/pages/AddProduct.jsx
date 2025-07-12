// src/pages/AddProduct.jsx - Większe czcionki w formularzu

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function AddProduct() {
  // ... logika bez zmian ...
  const [loading, setLoading] = useState(false); const [productName, setProductName] = useState(''); const [category, setCategory] = useState(''); const [subcategory, setSubcategory] = useState(''); const [unit, setUnit] = useState('szt.'); const [initialQuantity, setInitialQuantity] = useState(0); const [notes, setNotes] = useState('');
  const navigate = useNavigate(); const { toast } = useToast();
  async function handleSubmit(event) { event.preventDefault(); if (!productName || !category) { toast({ title: "Błąd walidacji", description: "Nazwa i kategoria produktu są wymagane.", variant: "destructive", }); return } setLoading(true); try { await supabase.from('produkty').insert({ nazwa: productName, kategoria: category, podkategoria: subcategory, jednostka: unit, ilosc: initialQuantity, uwagi: notes, }); toast({ title: "Sukces!", description: `Produkt "${productName}" został pomyślnie dodany.`, }); navigate('/') } catch (error) { toast({ title: "Błąd serwera", description: error.message, variant: "destructive", }) } finally { setLoading(false) } }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl font-bold">Dodaj Nowy Produkt</h1> {/* Zwiększony tytuł */}
      <Card className="w-full md:max-w-xl">
        <CardHeader><CardTitle className="text-2xl">Wprowadź dane</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6"> {/* Zwiększony odstęp */}
            <div className="grid gap-2">
              <Label htmlFor="productName" className="text-lg">Nazwa produktu</Label> {/* Zwiększona etykieta */}
              <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} required className="text-lg"/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-lg">Kategoria</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="text-lg"/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subcategory" className="text-lg">Podkategoria</Label>
              <Input id="subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="text-lg"/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-lg">Uwagi</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="text-lg"/>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 grid gap-2">
                <Label htmlFor="initialQuantity" className="text-lg">Ilość początkowa</Label>
                <Input id="initialQuantity" type="number" min="0" step="0.01" value={initialQuantity} onChange={(e) => setInitialQuantity(parseFloat(e.target.value))} required className="text-lg"/>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit" className="text-lg">Jednostka</Label>
                <Select onValueChange={setUnit} defaultValue="szt.">
                  <SelectTrigger id="unit" className="text-lg"><SelectValue /></SelectTrigger>
                  <SelectContent className="text-lg"><SelectItem value="szt.">szt.</SelectItem><SelectItem value="mb">mb</SelectItem><SelectItem value="kg">kg</SelectItem><SelectItem value="op.">op.</SelectItem><SelectItem value="m²">m²</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2 text-lg py-6">{loading ? 'Dodawanie...' : 'Dodaj produkt'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}