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

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [unit, setUnit] = useState('szt.');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function getProduct() {
      setLoading(true);
      const { data, error } = await supabase
        .from('produkty')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast({ title: "Błąd", description: "Nie udało się pobrać danych produktu.", variant: "destructive" });
        navigate('/');
      } else if (data) {
        setProductName(data.nazwa);
        setCategory(data.kategoria);
        setSubcategory(data.podkategoria || '');
        setUnit(data.jednostka || 'szt.');
        setNotes(data.uwagi || '');
      }
      setLoading(false);
    }
    getProduct();
  }, [id, navigate, toast]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('produkty')
        .update({
          nazwa: productName,
          kategoria: category,
          podkategoria: subcategory,
          jednostka: unit,
          uwagi: notes,
        })
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Sukces!", description: "Dane produktu zostały zaktualizowane." });
      navigate('/');
    } catch (error) {
      toast({ title: "Błąd serwera", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="text-center">Ładowanie danych produktu...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Edytuj Produkt</h1>
      <Card className="w-full md:max-w-xl">
        <CardHeader>
          <CardTitle>Zmień dane produktu</CardTitle>
        </CardHeader>
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
              <Label htmlFor="subcategory">Podkategoria</Label>
              <Input id="subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Uwagi</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Wpisz dodatkowe informacje..."/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit">Jednostka</Label>
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
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}