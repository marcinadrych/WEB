// src/pages/QRPage.jsx

import { useLocation } from 'react-router-dom';
import * as QRCode from 'qrcode.react';
import { Button } from "@/components/ui/button";

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
          <QRCode.default
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