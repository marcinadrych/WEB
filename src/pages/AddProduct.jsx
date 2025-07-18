import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import CategoryCombobox from '@/components/CategoryCombobox'

export default function AddProduct() {
  const [loading, setLoading] = useState(false)
  const [allCategories, setAllCategories] = useState([])
  const [allSubcategories, setAllSubcategories] = useState([])

  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [unit, setUnit] = useState('szt.')
  const [initialQuantity, setInitialQuantity] = useState('0')
  const [notes, setNotes] = useState('')
  
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    async function getExistingOptions() {
      const { data, error } = await supabase.from('produkty').select('kategoria, podkategoria');
      if (data) {
        const uniqueCategories = [...new Set(data.map(p => p.kategoria).filter(Boolean))];
        const uniqueSubcategories = [...new Set(data.map(p => p.podkategoria).filter(Boolean))];
        setAllCategories(uniqueCategories);
        setAllSubcategories(uniqueSubcategories);
      }
    }
    getExistingOptions();
  }, [])

  async function handleSubmit(event) {
    event.preventDefault();
    if (!productName || !category) {
      toast({ title: "Błąd walidacji", description: "Nazwa i kategoria produktu są wymagane.", variant: "destructive" });
      return;
    }
    const quantityToInsert = parseFloat(initialQuantity);
    if (isNaN(quantityToInsert)) {
      toast({ title: "Błąd walidacji", description: "Wprowadzona ilość jest nieprawidłowa.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await supabase.from('produkty').insert({
        nazwa: productName,
        kategoria: category,
        podkategoria: subcategory || null,
        uwagi: notes || null,
        jednostka: unit,
        ilosc: quantityToInsert,
      });
      toast({ title: "Sukces!", description: `Produkt "${productName}" został pomyślnie dodany.` });
      navigate('/');
    } catch (error) {
      console.error("Błąd z Supabase:", error);
      toast({ title: "Błąd serwera", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dodaj Nowy Produkt</h1>
      <Card className="w-full md:max-w-xl">
        <CardHeader><CardTitle>Wprowadź dane nowego produktu</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="productName">Nazwa produktu</Label>
              <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} required />
            </div>
            
            <div className="grid gap-2">
              <Label>Kategoria</Label>
              <CategoryCombobox 
                value={category}
                setValue={setCategory}
                options={allCategories}
                placeholder="Wybierz lub wpisz nową..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Podkategoria (opcjonalnie)</Label>
              <CategoryCombobox 
                value={subcategory}
                setValue={setSubcategory}
                options={allSubcategories}
                placeholder="Wybierz lub wpisz nową..."
              />
            </div>
            
            <div className="grid gap-2"><Label htmlFor="notes">Uwagi (opcjonalnie)</Label><Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 grid gap-2"><Label htmlFor="initialQuantity">Ilość początkowa</Label><Input id="initialQuantity" type="number" min="0" step="any" value={initialQuantity} onChange={(e) => setInitialQuantity(e.target.value)} required /></div>
              <div className="grid gap-2"><Label htmlFor="unit">Jednostka</Label><Select onValueChange={setUnit} defaultValue="szt."><SelectTrigger id="unit"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="szt.">szt.</SelectItem><SelectItem value="mb">mb</SelectItem><SelectItem value="kg">kg</SelectItem><SelectItem value="op.">op.</SelectItem><SelectItem value="m²">m²</SelectItem></SelectContent></Select></div>
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2">{loading ? 'Dodawanie...' : 'Dodaj produkt'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}