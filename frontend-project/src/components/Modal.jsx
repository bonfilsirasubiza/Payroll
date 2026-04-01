import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
          <X size={20} />
        </button>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  </div>
);