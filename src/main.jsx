import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import IdleGuard from './components/IdleGuard.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

// Service worker de la PWA: solo en producción, para no cachear nada mientras se desarrolla
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => console.error('No se pudo registrar el service worker:', error));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <App />
        <IdleGuard />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
);