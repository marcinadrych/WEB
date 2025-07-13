// src/components/QrCodeDisplay.jsx

import { useEffect, useState } from 'react';
import QRCode from 'qrcode'; // Importujemy nową bibliotekę

export default function QrCodeDisplay({ value }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    // Generujemy kod QR jako Data URL, gdy tylko dostaniemy `value`
    QRCode.toDataURL(value, { width: 256, margin: 2 })
      .then(url => {
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error("Błąd generowania kodu QR:", err);
      });
  }, [value]);

  if (!qrCodeUrl) {
    return <p>Generowanie kodu QR...</p>;
  }

  // Zwykły tag <img> jest najbardziej niezawodnym sposobem wyświetlania
  return <img src={qrCodeUrl} alt="Kod QR" />;
}