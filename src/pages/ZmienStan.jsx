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
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')

  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    async function getProducts() {
      const { data, error } = await supabase.from('produkty').select('id, nazwa, ilosc, jednostka').order('nazwa', { ascending: true })
      if (error) {
        toast({ title: "Błąd", description: "Nie udało się pobrać listy produktów.", variant: "destructive" })
      } else {
        setProducts(data || [])
      }
      setLoading(false)
    }
    getProducts()
  }, [toast])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedProductId || !quantity) {
      toast({ title: "Błąd walidacji", description: "Musisz wybrać produkt i podać ilość.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Użytkownik nie jest zalogowany.")

      await supabase.from('operacje').insert({
        id_produktu: parseInt(selectedProductId, 10),
        typ_operacji: operationType,
        ilosc_zmieniona: quantity,
        pracownik_email: session.user.email,
        uwagi: notes,
      })

      const selectedProduct = products.find(p => p.id === parseInt(selectedProductId, 10))
      const currentQuantity = selectedProduct.ilosc
      const newQuantity = operationType === 'przyjecie' ? currentQuantity + quantity : currentQuantity - quantity

      if (newQuantity < 0) throw new Error('Stan magazynowy nie może być ujemny.')

      await supabase.from('produkty').update({ ilosc: newQuantity }).eq('id', parseInt(selectedProductId, 10))

      toast({ title: "Sukces!", description: "Stan magazynowy został zaktualizowany." })
      navigate('/')
    } catch (error) {
      toast({ title: "Błąd serwera", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  function FormContent() {
    return (
      <Card>
        <CardHeader><CardTitle>{operationType === 'zuzycie' ? 'Rejestrowanie zużycia' : 'Rejestrowanie dostawy'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Produkt</Label>
              <Select onValueChange={setSelectedProductId} value={selectedProductId} required>
                <SelectTrigger id="product"><SelectValue placeholder="Wybierz produkt z listy..." /></SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Ładowanie...</SelectItem>
                  ) : (
                    products.map(product => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        {product.nazwa} (Obecny stan: {product.ilosc} {product.jednostka})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="quantity">Ilość</Label>
              <Input id="quantity" type="number" min="0.01" step="0.01" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value))} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Uwagi (np. do jakiego zlecenia)</Label>
              <Input id="notes" type="text" placeholder="np. Remont łazienki, ul. Słoneczna 5" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Zapisywanie...' : `Zatwierdź ${operationType === 'zuzycie' ? 'zużycie' : 'dostawę'}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Zmień Stan Magazynowy</h1>
      <Tabs value={operationType} onValueChange={setOperationType} className="w-full md:max-w-xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="zuzycie">Odejmij ze Stanu (Zużycie)</TabsTrigger>
          <TabsTrigger value="przyjecie">Dodaj do Stanu (Dostawa)</TabsTrigger>
        </TabsList>
        <TabsContent value="zuzycie"><FormContent /></TabsContent>
        <TabsContent value="przyjecie"><FormContent /></TabsContent>
      </Tabs>
    </div>
  )
}