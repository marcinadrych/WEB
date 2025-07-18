// src/components/ProductListItem.jsx

import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ProductListItem({ product }) {
  const qrPageUrl = `/qr?value=${product.id}&name=${encodeURIComponent(product.nazwa)}`;

  return (
    <AccordionItem value={`item-${product.id}`} key={product.id} className="border-b last:border-b-0">
      <AccordionTrigger className="hover:no-underline p-4">
        {/* ... bez zmian ... */}
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-4 p-4 border-t bg-muted/50 text-base">
          {/* ... bez zmian ... */}
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