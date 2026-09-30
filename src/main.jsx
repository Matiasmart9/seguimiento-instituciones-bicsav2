import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import IdleGuard from './components/IdleGuard.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

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