// src/components/ProductListItem.jsx

import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getUserName } from '@/lib/users';
import { Plus, Minus } from 'lucide-react';
// --- ZMIANA NR 1: Dodajemy importy do formatowania daty ---
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function ProductListItem({ product, onQuickUpdate }) {
  const qrPageUrl = `/qr?value=${product.id}&name=${encodeURIComponent(product.nazwa)}`;
  
  // --- ZMIANA NR 2: Dodajemy logikę formatowania daty i pobierania imienia ---
  const displayName = getUserName(product.ostatnia_zmiana_przez);
  const timeAgo = product.data_ostatniej_zmiany 
    ? formatDistanceToNow(new Date(product.data_ostatniej_zmiany), { addSuffix: true, locale: pl })
    : null;

  return (
    <AccordionItem value={`product-${product.id}`} key={product.id} className="border-b last:border-b-0">
      <AccordionTrigger className="hover:no-underline p-4 text-left">
        <div className="flex justify-between items-center w-full">
          {/* --- ZMIANA NR 3: Dodajemy nową sekcję z informacjami pod nazwą produktu --- */}
          <div className="flex-grow">
            <span className="font-medium text-lg">{product.nazwa} {product.wymiar || ''}</span>
            {timeAgo && (
              <p className="text-xs text-muted-foreground text-left mt-1">
                Ostatnia zmiana: {timeAgo} przez {displayName}
              </p>
            )}
          </div>
          <span className={`font-bold text-2xl ml-4 ${product.ilosc < 5 ? 'text-red-500' : 'text-green-500'}`}>
            {product.ilosc} {product.jednostka}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {/* Twoja reszta kodu jest idealna i pozostaje nietknięta */}
        <div className="flex flex-col gap-4 p-4 border-t bg-muted/50 text-base">
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Kategoria:</strong><br/>{product.kategoria}</div>
            <div><strong>Podkategoria:</strong><br/>{product.podkategoria || '---'}</div>
          </div>
          {product.uwagi && (
            <div>
              <strong>Uwagi:</strong>
              <p className="text-muted-foreground whitespace-pre-wrap">{product.uwagi}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between p-2 mt-2 bg-background rounded-md">
            <span className="font-semibold">Szybka zmiana stanu:</span>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={(e) => { e.stopPropagation(); onQuickUpdate(product, 'remove'); }}>
                <Minus className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={(e) => { e.stopPropagation(); onQuickUpdate(product, 'add'); }}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end pt-2">
            <a href={qrPageUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">Pokaż QR</Button>
            </a>
            <Link to={`/edytuj-produkt/${product.id}`}>
              <Button size="sm">Edytuj</Button>
            </Link>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}