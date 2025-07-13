// src/components/ProductListItem.jsx - Wersja dla Płaskiej Listy

import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export default function ProductListItem({ product }) {
  const qrPageUrl = `/qr?value=${product.id}&name=${encodeURIComponent(product.nazwa)}`;

  return (
    // Zwykły div z obramowaniem, a nie element akordeonu
    <div className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      
      {/* Informacje o produkcie */}
      <div className="flex-grow">
        <h3 className="font-bold text-lg">{product.nazwa}</h3>
        <p className="text-sm text-muted-foreground">
          {product.kategoria} {product.podkategoria ? `/ ${product.podkategoria}` : ''}
        </p>
        {product.uwagi && <p className="text-xs mt-1 italic">{product.uwagi}</p>}
      </div>

      {/* Ilość i Akcje */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <span className={`flex-grow md:flex-grow-0 text-left md:text-right font-bold text-2xl ${product.ilosc < 5 ? 'text-red-500' : 'text-green-500'}`}>
          {product.ilosc} {product.jednostka}
        </span>
        <div className="flex gap-2">
          <a href={qrPageUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">QR</Button>
          </a>
          <Link to={`/edytuj-produkt/${product.id}`}>
            <Button size="sm">Edytuj</Button>
          </Link>
        </div>
      </div>

    </div>
  )
}