import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function AddProduct() {
  const [loading, setLoading] = useState(false)
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [initialQuantity, setInitialQuantity] = useState(0)
  
  const navigate = useNavigate() // Do przekierowania po sukcesie
  const { toast } = useToast() // Do pokazywania powiadomień

  async function handleSubmit(event) {
    event.preventDefault()
    if (!productName || !category) {
      toast({
        title: "Błąd walidacji",
        description: "Nazwa i kategoria produktu są wymagane.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('produkty').insert({
        nazwa: productName,
        kategoria: category,
        ilosc: initialQuantity,
      })

      if (error) throw error

      toast({
        title: "Sukces!",
        description: `Produkt "${productName}" został pomyślnie dodany.`,
      })
      
      navigate('/') // Przekieruj na stronę główną po sukcesie
    } catch (error) {
      toast({
        title: "Błąd serwera",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dodaj Nowy Produkt</h1>
      <Card className="w-full md:max-w-xl">
        <CardHeader>
          <CardTitle>Wprowadź dane nowego produktu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="productName">Nazwa produktu</Label>
              <Input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="np. Rura miedziana 15mm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Kategoria</Label>
              <Input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="np. Rury"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="initialQuantity">Ilość początkowa</Label>
              <Input
                id="initialQuantity"
                type="number"
                min="0"
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(parseInt(e.target.value, 10))}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Dodawanie...' : 'Dodaj produkt do bazy'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}