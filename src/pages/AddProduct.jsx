import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function AddProduct() {
  const [loading, setLoading] = useState(false)
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [unit, setUnit] = useState('szt.')
  const [initialQuantity, setInitialQuantity] = useState(0)
  const [notes, setNotes] = useState('')

  const navigate = useNavigate()
  const { toast } = useToast()

  const handleQuantityChange = (e) => {
    // Ta funkcja zapewnia, że stan zawsze będzie liczbą
    const value = parseFloat(e.target.value);
    setInitialQuantity(isNaN(value) ? 0 : value);
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!productName || !category) {
      toast({ title: "Błąd walidacji", description: "Nazwa i kategoria produktu są wymagane.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Upewniamy się, że ilość jest liczbą, domyślnie 0
      const quantityToInsert = isNaN(initialQuantity) ? 0 : initialQuantity;

      const { error } = await supabase.from('produkty').insert({
        nazwa: productName,
        kategoria: category,
        podkategoria: subcategory,
        jednostka: unit,
        ilosc: quantityToInsert, // Używamy bezpiecznej wartości
        uwagi: notes,
      });

      if (error) throw error;

      toast({ title: "Sukces!", description: `Produkt "${productName}" został pomyślnie dodany.` });
      navigate('/');
    } catch (error) {
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
              <Label htmlFor="category">Kategoria</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subcategory">Podkategoria (opcjonalnie)</Label>
              <Input id="subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Uwagi</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 grid gap-2">
                <Label htmlFor="initialQuantity">Ilość początkowa</Label>
                <Input id="initialQuantity" type="number" min="0" step="0.01" value={initialQuantity} onChange={handleQuantityChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Jednostka</Label>
                <Select onValueChange={setUnit} defaultValue="szt.">
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
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2">{loading ? 'Dodawanie...' : 'Dodaj produkt'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}