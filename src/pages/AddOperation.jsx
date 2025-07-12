import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function AddOperation() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  
  // Stany dla formularza
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [operationType, setOperationType] = useState('zuzycie')
  const [notes, setNotes] = useState('')

  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    async function getProducts() {
      const { data, error } = await supabase
        .from('produkty')
        .select('id, nazwa, ilosc')
        .order('nazwa', { ascending: true })
      
      if (error) {
        toast({ title: "Błąd", description: "Nie udało się pobrać listy produktów.", variant: "destructive" })
      } else {
        setProducts(data)
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

      const { error: operationError } = await supabase.from('operacje').insert({
        id_produktu: parseInt(selectedProductId, 10), // Konwersja na liczbę
        typ_operacji: operationType,
        ilosc_zmieniona: quantity,
        pracownik_email: session.user.email,
        uwagi: notes,
      })
      if (operationError) throw operationError

      const selectedProduct = products.find(p => p.id === parseInt(selectedProductId, 10))
      const currentQuantity = selectedProduct.ilosc

      const newQuantity =
        operationType === 'przyjecie'
          ? currentQuantity + quantity
          : currentQuantity - quantity

      if (newQuantity < 0) {
        throw new Error('Stan magazynowy nie może być ujemny.')
      }

      const { error: updateError } = await supabase
        .from('produkty')
        .update({ ilosc: newQuantity })
        .eq('id', parseInt(selectedProductId, 10))
      if (updateError) throw updateError

      toast({ title: "Sukces!", description: "Operacja została pomyślnie zapisana." })
      navigate('/')
    } catch (error) {
      toast({ title: "Błąd serwera", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dodaj Nową Operację</h1>
      <Card className="w-full md:max-w-xl">
        <CardHeader>
          <CardTitle>Wprowadź dane operacji</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Produkt</Label>
              <Select onValueChange={setSelectedProductId} value={selectedProductId} required>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Wybierz produkt z listy..." />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Ładowanie...</SelectItem>
                  ) : (
                    products.map(product => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        {product.nazwa} (Stan: {product.ilosc})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="operationType">Typ operacji</Label>
              <Select onValueChange={setOperationType} defaultValue="zuzycie">
                <SelectTrigger id="operationType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zuzycie">Zużycie</SelectItem>
                  <SelectItem value="przyjecie">Przyjęcie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="quantity">Ilość</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Uwagi (opcjonalnie)</Label>
              <Input
                id="notes"
                type="text"
                placeholder="np. Zlecenie dla klienta X"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Zapisywanie...' : 'Zapisz operację'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}