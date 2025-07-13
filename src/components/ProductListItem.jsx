// src/components/ProductListItem.jsx - Wersja dla Akordeonu

import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ProductListItem({ product }) {
  const qrPageUrl = `/qr?value=${product.id}&name=${encodeURIComponent(product.nazwa)}`;

  return (
    <AccordionItem value={`product-${product.id}`} key={product.id} className="border-b last:border-b-0">
      <AccordionTrigger className="hover:no-underline p-4 text-left">
        <div className="flex justify-between items-center w-full">
          <span className="font-medium text-lg">{product.nazwa}</span>
          <span className={`font-bold text-2xl ${product.ilosc < 5 ? 'text-red-500' : 'text-green-500'}`}>
            {product.ilosc} {product.jednostka}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-4 p-4 border-t bg-muted/50 text-base">
          {/* Usunęliśmy stąd Kategorię i Podkategorię, bo są już w nagłówkach */}
          {product.uwagi && (
            <div>
              <strong>Uwagi:</strong>
              <p className="text-muted-foreground whitespace-pre-wrap">{product.uwagi}</p>
            </div>
          )}
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