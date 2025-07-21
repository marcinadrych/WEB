// src/hooks/useQrScanner.jsx

import { useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from "@/components/ui/button";
// --- POPRAWIONE IMPORTY ---
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CardDescription } from "@/components/ui/card"; // <<< Poprawny import
import { QrCode } from 'lucide-react';

const qrcodeRegionId = "html5qr-code-full-region-hook";

export function useQrScanner(onScanSuccess) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const scannerRef = useRef(null);

  const startScanner = () => {
    setIsOpen(true); // Otwórz okno od razu
    setIsCameraRunning(true);
    setTimeout(async () => {
      try {
        await Html5Qrcode.getCameras();
        const scanner = new Html5Qrcode(qrcodeRegionId, false);
        scannerRef.current = scanner;
        const handleScanSuccess = (decodedText) => {
          stopScanner();
          onScanSuccess(decodedText);
        };
        scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, handleScanSuccess, () => {});
      } catch (err) {
        console.error("Błąd inicjalizacji skanera:", err);
        stopScanner();
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .finally(() => {
          setIsCameraRunning(false);
          setIsOpen(false);
        });
    } else {
      setIsCameraRunning(false);
      setIsOpen(false);
    }
  };

  const ScannerDialog = (
    <Dialog open={isOpen} onOpenChange={(openState) => !openState && stopScanner()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skaner Kodów QR</DialogTitle>
          <CardDescription>Umieść kod QR w ramce.</CardDescription>
        </DialogHeader>
        <div id={qrcodeRegionId} className="w-full mt-4 rounded-lg overflow-hidden"></div>
        {/* Usunęliśmy stąd przycisk "Pozwól na użycie aparatu", bo jest teraz automatyczny */}
        <Button variant="outline" onClick={stopScanner} className="mt-4 w-full">Anuluj</Button>
      </DialogContent>
    </Dialog>
  );

  return { openScanner: startScanner, ScannerDialog };
}