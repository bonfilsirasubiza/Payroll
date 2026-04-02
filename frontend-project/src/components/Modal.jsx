import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ title, children, onClose }) => (
  <div
    className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200 p-4 sm:p-6"
    onClick={onClose}
  >
    <div className="flex min-h-full items-start justify-center sm:items-center">
      <div
        className="w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 bg-gray-50/50 gap-3">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 uppercase tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-8 overflow-y-auto max-h-[calc(100vh-8rem)] sm:max-h-[calc(90vh-6.5rem)]">
          {children}
        </div>
      </div>
    </div>
  </div>
);
