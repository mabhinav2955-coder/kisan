import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  subtext?: string;
  icon?: React.ReactNode;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, subtext, icon, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-start space-x-3 bg-white border border-green-200 rounded-xl shadow-lg px-4 py-3">
        {icon}
        <div>
          <div className="text-gray-900 font-semibold">{message}</div>
          {subtext && <div className="text-sm text-gray-600">{subtext}</div>}
        </div>
        <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">✕</button>
      </div>
    </div>
  );
}


