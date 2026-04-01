import React from 'react';

export const Card = ({ title, value, icon: Icon, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className={`p-4 rounded-2xl ${colors[color]}`}>
        {Icon && <Icon size={28} />}
      </div>
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-gray-800 mt-1">{value}</h3>
      </div>
    </div>
  );
};