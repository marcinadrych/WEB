// src/components/SearchResultItem.jsx

import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
// --- ZMIANA NR 1: Dodajemy import ikon ---
import { Plus, Minus } from 'lucide-react'; 

// --- ZMIANA NR 2: Komponent teraz przyjmuje nową właściwość `onQuickUpdate` ---
export default function SearchResultItem({ product, onQuickUpdate }) {
  const qrPageUrl = `/qr?value=${product.id}&name=${encodeURIComponent(product.nazwa)}`;

  return (
    // Używamy flex-col, żeby nowa sekcja była pod spodem
    <div className="border rounded-lg p-4 flex flex-col gap-4">
      
      {/* Ta sekcja pozostaje bez zmian */}
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="font-bold text-lg">{product.nazwa}</h3>
          <p className="text-sm text-muted-foreground">
            {product.kategoria} {product.podkategoria ? `/ ${product.podkategoria}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
            <a href={qrPageUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">QR</Button>
            </a>
            <Link to={`/edytuj-produkt/${product.id}`}>
              <Button size="sm">Edytuj</Button>
            </Link>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
        <span className="font-semibold">Zmień stan:</span>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => onQuickUpdate(product, -1)}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className={`font-bold text-2xl w-24 text-center ${product.ilosc < 5 ? 'text-red-500' : 'text-green-500'}`}>
            {product.ilosc} {product.jednostka}
          </span>
          <Button size="icon" variant="outline" onClick={() => onQuickUpdate(product, 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
    </div>
  )
}