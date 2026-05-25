import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

function ThemedToaster() {
  const isLight = document.documentElement.classList.contains('light');
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: isLight
          ? { background: '#fffdf8', color: '#2c1810', border: '1px solid #ddd0bc' }
          : { background: '#1a0e08', color: '#fefce8', border: '1px solid #321c10' },
        success: { iconTheme: { primary: '#006233', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#C1272D', secondary: '#fff' } },
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <ThemedToaster />
    </BrowserRouter>
  </React.StrictMode>
);
