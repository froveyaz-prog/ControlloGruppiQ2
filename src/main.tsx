import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Registrazione del Service Worker PWA per funzionamento offline e installazione
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => console.log('PWA ServiceWorker attivo:', reg.scope))
      .catch((err) => console.warn('PWA ServiceWorker non disponibile:', err));
  });
}

createRoot(document.getElementById('root')!).render(<App />);
