// src/pages/ZmienStan.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ZmienStan() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  
  const [operationType, setOperationType] = useState('zuzycie')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')

  const { toast } = useToast()

  useEffect(() => {
    async function getProducts() {
      const { data } = await supabase.from('produkty').select('id, nazwa, ilosc, jednostka').order('nazwa', { ascending: true })
      setProducts(data || [])
      setLoading(false)
    }
    getProducts()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    
    const quantityToChange = parseFloat(quantity);
    if (!selectedProductId || isNaN(quantityToChange) || quantityToChange <= 0) {
      toast({ title: "Błąd walidacji", description: "Wybierz produkt i podaj poprawną, dodatnią ilość.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Błąd sesji użytkownika.")

      const productId = parseInt(selectedProductId, 10);
      const selectedProduct = products.find(p => p.id === productId);
      if (!selectedProduct) throw new Error("Nie można znaleźć wybranego produktu.");

      const currentQuantity = parseFloat(selectedProduct.ilosc);
      const newQuantity = operationType === 'przyjecie' 
        ? currentQuantity + quantityToChange 
        : currentQuantity - quantityToChange;

      if (newQuantity < 0) throw new Error('Stan magazynowy nie może być ujemny.')

      // Zapisujemy log operacji
      const { error: operationError } = await supabase.from('operacje').insert({
        id_produktu: productId,
        typ_operacji: operationType,
        ilosc_zmieniona: quantityToChange,
        pracownik_email: session.user.email,
        uwagi: notes,
      });
      if (operationError) throw operationError;
      
      // Aktualizujemy główną tabelę produktów
      const { error: updateError } = await supabase
        .from('produkty')
        .update({ ilosc: newQuantity })
        .eq('id', productId);
      if (updateError) throw updateError;

      toast({ title: "Sukces!", description: "Stan magazynowy został zaktualizowany." })
      window.location.href = '/'; // Twarde przeładowanie
    } catch (error) {
      console.error("Błąd zmiany stanu:", error)
      toast({ title: "Błąd serwera", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }
  
  // Reszta kodu (return z formularzem) jest bez zmian
  function FormContent() {
    return (
      <Card><CardHeader><CardTitle>{operationType === 'zuzycie' ? 'Rejestrowanie zużycia' : 'Rejestrowanie dostawy'}</CardTitle></CardHeader><CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2"><Label>Produkt</Label><Select onValueChange={setSelectedProductId} value={selectedProductId} required><SelectTrigger><SelectValue placeholder="Wybierz produkt..." /></SelectTrigger><SelectContent>{loading ? <SelectItem value="loading" disabled>Ładowanie...</SelectItem> : products.map(p => (<SelectItem key={p.id} value={String(p.id)}>{p.nazwa} (Stan: {p.ilosc} {p.jednostka})</SelectItem>))}</SelectContent></Select></div>
          <div className="grid gap-2"><Label>Ilość do {operationType === 'zuzycie' ? 'odjęcia' : 'dodania'}</Label><Input type="number" min="0.01" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></div>
          <div className="grid gap-2"><Label>Uwagi (np. do zlecenia)</Label><Input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <Button type="submit" disabled={loading} className="w-full mt-2">{loading ? 'Zapisywanie...' : `Zatwierdź`}</Button>
        </form>
      </CardContent></Card>
    )
  }
  return (
    <div className="flex flex-col gap-6"><h1 className="text-3xl font-bold">Zmień Stan Magazynowy</h1><Tabs value={operationType} onValueChange={setOperationType} className="w-full md:max-w-xl"><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="zuzycie">Odejmij (Zużycie)</TabsTrigger><TabsTrigger value="przyjecie">Dodaj (Dostawa)</TabsTrigger></TabsList><TabsContent value="zuzycie"><FormContent /></TabsContent><TabsContent value="przyjecie"><FormContent /></TabsContent></Tabs></div>
  )
}