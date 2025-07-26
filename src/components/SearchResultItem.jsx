// src/components/SearchResultItem.jsx

import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus, Minus } from 'lucide-react';
// --- ZMIANA NR 1: Dodajemy importy do formatowania daty ---
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function SearchResultItem({ product, onQuickUpdate }) {
  const qrPageUrl = `/qr?value=${product.id}&name=${encodeURIComponent(product.nazwa)}`;

  // --- ZMIANA NR 2: Dodajemy logikę formatowania daty ---
  const timeAgo = product.data_ostatniej_zmiany 
    ? formatDistanceToNow(new Date(product.data_ostatniej_zmiany), { addSuffix: true, locale: pl })
    : null;

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-4">
      
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="font-bold text-lg">{product.nazwa} {product.wymiar || ''}</h3>
          <p className="text-sm text-muted-foreground">
            {product.kategoria} {product.podkategoria ? `/ ${product.podkategoria}` : ''}
          </p>
          {timeAgo && (
            <p className="text-xs text-muted-foreground mt-1">
              Ostatnia zmiana: {timeAgo} przez {product.ostatnia_zmiana_przez || '---'}
            </p>
          )}
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
      {product.uwagi && (
        <div className="text-sm border-t pt-2 mt-2">
          <strong>Uwagi:</strong>
          <p className="text-muted-foreground whitespace-pre-wrap">{product.uwagi}</p>
        </div>
      )}
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
        <span className="font-semibold">Zmień stan:</span>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => onQuickUpdate(product, 'remove')}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className={`font-bold text-2xl w-24 text-center ${product.ilosc < 5 ? 'text-red-500' : 'text-green-500'}`}>
            {product.ilosc} {product.jednostka}
          </span>
          <Button size="icon" variant="outline" onClick={() => onQuickUpdate(product, 'add')}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
    </div>
  )
}