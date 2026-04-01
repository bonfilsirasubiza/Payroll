import React from 'react';

export const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    secondary: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    danger: "bg-red-600 hover:bg-red-700 shadow-red-200",
  };

  return (
    <button
      {...props}
      className={`w-full text-white font-black py-3.5 rounded-xl transition-all active:scale-95 shadow-lg uppercase tracking-widest text-xs ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};