// src/hooks/usePWAInstall.js

import { useEffect, useState } from 'react';

export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Sprawdzamy, czy aplikacja już jest uruchomiona w trybie "standalone"
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
    
    const handleBeforeInstallPrompt = (event) => {
      // Zapobiegamy domyślnemu pojawieniu się banera przeglądarki
      event.preventDefault();
      // Zapisujemy zdarzenie, żeby móc je wywołać później
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Czyszczenie
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      // To jest obejście dla iOS/Safari, gdzie trzeba poinstruować użytkownika ręcznie
      alert('Aby zainstalować aplikację na iPhonie: dotknij przycisku Udostępnij, a następnie "Dodaj do ekranu początkowego".');
      return;
    }
    
    // Wywołujemy zapisany monit instalacji
    installPrompt.prompt();

    // Czekamy na decyzję użytkownika
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Użytkownik zainstalował aplikację');
      } else {
        console.log('Użytkownik odrzucił instalację');
      }
      // Czyścimy monit, bo jest jednorazowy
      setInstallPrompt(null);
    });
  };

  // Zwracamy informację, czy pokazać przycisk, oraz funkcję do jego obsługi
  // Nie pokazujemy przycisku, jeśli apka już jest zainstalowana (standalone)
  return { canInstall: !isStandalone && installPrompt, handleInstall: handleInstallClick };
};