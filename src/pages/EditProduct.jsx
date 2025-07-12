// src/pages/EditProduct.jsx

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import CategoryCombobox from '@/components/CategoryCombobox'

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);

  // Stany formularza
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [unit, setUnit] = useState('szt.');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: productData, error: productError } = await supabase.from('produkty').select('*').eq('id', id).single();
      if (productError) { /* ... obsługa błędu ... */ } 
      if (productData) {
        setProductName(productData.nazwa);
        setCategory(productData.kategoria);
        setSubcategory(productData.podkategoria || '');
        setUnit(productData.jednostka || 'szt.');
        setNotes(productData.uwagi || '');
      }
      const { data: optionsData } = await supabase.from('produkty').select('kategoria, podkategoria');
      if (optionsData) {
        setAllCategories([...new Set(optionsData.map(p => p.kategoria).filter(Boolean))]);
        setAllSubcategories([...new Set(optionsData.map(p => p.podkategoria).filter(Boolean))]);
      }
      setLoading(false);
    }
    fetchData();
  }, [id, toast]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!productName || !category) { /* ... walidacja ... */ return; }

    setLoading(true);
    try {
      // --- POPRAWIONY OBIEKT UPDATE ---
      const { error } = await supabase
        .from('produkty')
        .update({
          nazwa: productName,
          kategoria: category,
          podkategoria: subcategory || null,
          jednostka: unit, // <<< UPEWNIAMY SIĘ, ŻE TO POLE JEST TUTAJ
          uwagi: notes || null,
        })
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Sukces!", description: "Dane produktu zostały zaktualizowane." });
      // Używamy twardego przeładowania, żeby Dashboard się odświeżył
      window.location.href = '/'; 
    } catch (error) {
      toast({ title: "Błąd serwera", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="text-center">Ładowanie...</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Edytuj Produkt</h1>
      <Card className="w-full md:max-w-xl">
        <CardHeader><CardTitle>Zmień dane produktu</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* ... pola Nazwa, Kategoria, Podkategoria ... */}
            <div className="grid gap-2"><Label>Nazwa produktu</Label><Input value={productName} onChange={(e) => setProductName(e.target.value)} required /></div>
            <div className="grid gap-2"><Label>Kategoria</Label><CategoryCombobox value={category} setValue={setCategory} options={allCategories} placeholder="Wybierz lub wpisz nową..." /></div>
            <div className="grid gap-2"><Label>Podkategoria</Label><CategoryCombobox value={subcategory} setValue={setSubcategory} options={allSubcategories} placeholder="Wybierz lub wpisz nową..." /></div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Uwagi</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="unit">Jednostka</Label>
              {/* Upewniamy się, że `value` jest poprawnie powiązane */}
              <Select onValueChange={setUnit} value={unit}>
                <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="szt.">szt.</SelectItem>
                  <SelectItem value="mb">mb</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="op.">op.</SelectItem>
                  <SelectItem value="m²">m²</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2">{loading ? 'Zapisywanie...' : 'Zapisz zmiany'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}