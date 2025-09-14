import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
  label?: string;
}

export default function BackButton({ onBack, label = "Back to Dashboard" }: BackButtonProps) {
  return (
    <button
      onClick={onBack}
      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors mb-6"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
