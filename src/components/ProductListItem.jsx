import { Link } from 'react-router-dom'
import * as QRCode from 'qrcode.react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function ProductListItem({ product }) {
  const qrCodeValue = String(product.id);

  return (
    <AccordionItem value={`item-${product.id}`} key={product.id} className="border-b last:border-b-0">
      <AccordionTrigger className="hover:no-underline p-4">
        <div className="flex justify-between items-center w-full">
          <span className="font-medium text-left text-lg">{product.nazwa}</span>
          <span className={`font-bold text-2xl ${product.ilosc < 5 ? 'text-red-500' : 'text-green-500'}`}>
            {product.ilosc} {product.jednostka}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
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
          <div className="flex gap-2 justify-end pt-2">
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Pokaż QR</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Kod QR dla: {product.nazwa}</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center p-6">
                  <QRCode.default
                    value={qrCodeValue}
                    size={256}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
              </DialogContent>
            </Dialog>
            
            <Link to={`/edytuj-produkt/${product.id}`}>
              <Button size="sm">Edytuj</Button>
            </Link>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}