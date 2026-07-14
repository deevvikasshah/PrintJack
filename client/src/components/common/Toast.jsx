import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

function ToastIcon({ type }) {
  const icons = {
    success: <CheckCircle size={18} className="text-emerald-500" />,
    error: <XCircle size={18} className="text-[#E63946]" />,
    warning: <AlertTriangle size={18} className="text-amber-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };
  return icons[type] || icons.info;
}

export const toastConfig = {
  duration: 4000,
  position: 'top-center',
  style: {
    background: '#fff',
    color: '#1D3557',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    fontSize: '14px',
    fontWeight: 500,
    maxWidth: '420px',
  },
  success: {
    iconTheme: { primary: '#10b981', secondary: '#fff' },
  },
  error: {
    iconTheme: { primary: '#E63946', secondary: '#fff' },
  },
};

export function ToastProvider() {
  return (
    <Toaster
      position={toastConfig.position}
      duration={toastConfig.duration}
      toastOptions={{
        style: toastConfig.style,
        success: toastConfig.success,
        error: toastConfig.error,
      }}
      reverseOrder={false}
    />
  );
}

export function showToast(type, message, options = {}) {
  return toast[type](message, { ...toastConfig, ...options });
}

export default ToastProvider;
