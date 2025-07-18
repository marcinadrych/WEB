import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";

export default function QrScannerDialog({ open, onClose, onDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    let stream = null;
    let animationId;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        const scan = () => {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext("2d");

          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code) {
              onDetected(code.data);
              onClose();
              return;
            }
          }

          animationId = requestAnimationFrame(scan);
        };

        scan();
      } catch (err) {
        console.error("Błąd dostępu do kamery:", err);
        setCameraError(true);
      }
    };

    if (open) {
      setCameraError(false);
      startCamera();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skaner Kodów QR</DialogTitle>
          <CardDescription>Umieść kod QR w zasięgu kamery.</CardDescription>
        </DialogHeader>

        {cameraError ? (
          <div className="text-center text-sm text-muted-foreground py-10">
            Brak dostępu do kamery. Sprawdź uprawnienia przeglądarki.
          </div>
        ) : (
          <div className="w-full aspect-video rounded overflow-hidden relative">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <Button variant="outline" onClick={onClose} className="mt-4 w-full">Anuluj</Button>
      </DialogContent>
    </Dialog>
  );
}
