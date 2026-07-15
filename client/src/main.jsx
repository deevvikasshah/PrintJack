import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '386863340573-giuhhqa2sg3b8m2bg9uet3phl6l0k0it.apps.googleusercontent.com'}>
          <AuthProvider>
            <CartProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1D3557',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                  },
                  success: {
                    iconTheme: { primary: '#E63946', secondary: '#fff' },
                  },
                  error: {
                    iconTheme: { primary: '#E63946', secondary: '#fff' },
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);
