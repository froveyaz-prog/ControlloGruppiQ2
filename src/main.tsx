import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Registrazione del Service Worker PWA per funzionamento offline e aggiornamento automatico
// Viene eseguita solo in produzione e solo fuori dagli iframe (evita errori di sicurezza nell'anteprima)
if (
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  window.self === window.top &&
  import.meta.env.PROD
) {
  window.addEventListener('load', () => {
    const hadController = !!navigator.serviceWorker.controller;
    let refreshing = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        console.log('PWA ServiceWorker attivo:', reg.scope);
        reg.update().catch(() => {});
      })
      .catch((err) => console.warn('PWA ServiceWorker non disponibile:', err));
  });
}

createRoot(document.getElementById('root')!).render(<App />);
