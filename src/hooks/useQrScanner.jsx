// src/hooks/useQrScanner.jsx

import { useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CardDescription } from "@/components/ui/card";
import { QrCode } from 'lucide-react';

// Używamy unikalnego ID, żeby uniknąć konfliktów
const qrcodeRegionId = "hooked-qr-scanner-region";

export function useQrScanner(onScanSuccess) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const scannerRef = useRef(null);

  // Ta funkcja będzie wywoływana przez przycisk w oknie dialogowym
  const startCamera = () => {
    // Nie otwieramy okna tutaj, ono już jest otwarte
    setIsCameraRunning(true); // Pokaż widok kamery

    setTimeout(async () => {
      try {
        const element = document.getElementById(qrcodeRegionId);
        if (!element) throw new Error("Element skanera nie został znaleziony.");
        
        await Html5Qrcode.getCameras();
        
        const scanner = new Html5Qrcode(qrcodeRegionId, false);
        scannerRef.current = scanner;

        const handleScanSuccess = (decodedText) => {
          stopScanner(); // Zatrzymaj kamerę i zamknij okno
          onScanSuccess(decodedText); // Przekaż wynik do Dashboardu
        };
        
        scanner.start(
          { facingMode: "environment" }, 
          { fps: 10, qrbox: { width: 250, height: 250 } }, 
          handleScanSuccess, 
          () => {}
        ).catch(() => {
          // Spróbuj z inną kamerą, jeśli tylna zawiedzie
          scanner.start(undefined, { fps: 10, qrbox: { width: 250, height: 250 } }, handleScanSuccess, () => {});
        });
      } catch (err) {
        console.error("Błąd inicjalizacji skanera:", err);
        stopScanner(); // Zamknij okno w razie błędu
      }
    }, 100);
  };

  // Ta funkcja zatrzymuje kamerę i zamyka okno
  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .catch(err => console.error("Błąd zatrzymywania skanera:", err))
        .finally(() => {
          setIsCameraRunning(false);
          setIsOpen(false);
        });
    } else {
      setIsCameraRunning(false);
      setIsOpen(false);
    }
  };
  
  // Ta funkcja jest teraz jedyną, którą eksportujemy do otwierania
  const openScanner = () => {
    setIsOpen(true);
  };


  const ScannerDialog = (
    <Dialog open={isOpen} onOpenChange={(openState) => { if (!openState) stopScanner(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skaner Kodów QR</DialogTitle>
          <CardDescription>Umieść kod QR w ramce.</CardDescription>
        </DialogHeader>
        
        {/* Kontener na widok kamery, widoczny tylko gdy kamera działa */}
        <div id={qrcodeRegionId} className={isCameraRunning ? "w-full mt-4 rounded-lg overflow-hidden" : "hidden"}></div>

        {/* Nasz własny przycisk, widoczny tylko na początku */}
        {!isCameraRunning && (
          <div className="flex flex-col items-center justify-center gap-4 my-8">
            <p>Kliknij, aby uruchomić kamerę.</p>
            <Button onClick={startCamera}>
              Pozwól na użycie aparatu
            </Button>
          </div>
        )}
        
        <Button variant="outline" onClick={stopScanner} className="mt-4 w-full">
          Anuluj
        </Button>
      </DialogContent>
    </Dialog>
  );

  // Zwracamy funkcję do otwierania okna i samo okno
  return { openScanner, ScannerDialog };
}