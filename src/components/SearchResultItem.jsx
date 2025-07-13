// src/components/SearchResultItem.jsx
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QrCodeDisplay from './QrCodeDisplay';

export default function SearchResultItem({ product }) {
  return (
    <div className="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <h3 className="font-medium text-lg">{product.nazwa}</h3>
        <p className="text-sm text-muted-foreground">{product.kategoria} / {product.podkategoria || 'Brak'}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className={`font-bold text-2xl ${product.ilosc < 5 ? 'text-red-500' : 'text-green-500'}`}>{product.ilosc} {product.jednostka}</span>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" size="sm">QR</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Kod QR dla: {product.nazwa}</DialogTitle></DialogHeader><div className="flex items-center justify-center p-6"><QrCodeDisplay value={String(product.id)} /></div></DialogContent>
          </Dialog>
          <Link to={`/edytuj-produkt/${product.id}`}><Button size="sm">Edytuj</Button></Link>
        </div>
      </div>
    </div>
  );
}