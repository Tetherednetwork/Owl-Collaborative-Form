import React, { useEffect } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-[100] animate-fade-in-out"
      role="status"
      aria-live="polite"
    >
      <CheckCircleIcon />
      <span className="font-semibold">{message}</span>
    </div>
  );
};

export default Toast;
