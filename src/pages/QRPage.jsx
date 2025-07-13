import { useLocation } from 'react-router-dom';
import qrcode from 'qrcode.react'; // Importujemy całą bibliotekę pod inną nazwą
import { Button } from "@/components/ui/button";

const QRCode = qrcode.default || qrcode;

export default function QRPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const qrValue = params.get('value');
  const productName = params.get('name');

  return (
    <div className="dark min-h-screen flex flex-col items-center justify-center gap-8 p-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold text-center">
        Kod QR dla: <br /> {productName || 'Nieznany produkt'}
      </h1>
      <div className="bg-white p-6 rounded-lg">
        {qrValue ? (
          <QRCode
            value={qrValue}
            size={256}
            level={"H"}
            includeMargin={true}
          />
        ) : (
          <p className="text-black">Brak danych do wygenerowania kodu.</p>
        )}
      </div>
      <Button onClick={() => window.print()}>
        Drukuj
      </Button>
    </div>
  );
}