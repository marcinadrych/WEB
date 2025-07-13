// src/components/QrCodeDisplay.jsx
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QrCodeDisplay({ value }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  useEffect(() => {
    QRCode.toDataURL(value, { width: 256, margin: 2 })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error("Błąd generowania QR:", err));
  }, [value]);

  if (!qrCodeUrl) return <p>Generowanie kodu...</p>;
  return <img src={qrCodeUrl} alt="Kod QR" />;
}