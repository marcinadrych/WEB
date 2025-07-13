import { useState, useEffect } from 'react'
import { supabase } from '@/supabaseClient'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProductListItem from '@/components/ProductListItem'

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getProducts()
  }, []);

  async function getProducts() {
    setLoading(true);
    const { data } = await supabase.from('produkty').select('*').order('nazwa');
    setProducts(data || []);
    setLoading(false);
  }

  const filteredProducts = products.filter(product => {
    return product.nazwa.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Aktualny Stan Magazynu</CardTitle>
          <Input
            placeholder="Szukaj..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 mt-4">
            {loading ? <p>Ładowanie...</p> : 
             filteredProducts.length > 0 ? 
             filteredProducts.map((product) => (
                <ProductListItem key={product.id} product={product} />
              )) : 
             <p>Nie znaleziono produktów.</p>
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}