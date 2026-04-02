import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const Card = ({ title, value, icon: Icon, color = "blue", to, hint }) => {
  const colorMap = {
    blue: { bg: "bg-gradient-to-br from-blue-900 to-indigo-900", icon: "bg-gradient-to-br from-blue-800 to-indigo-800 text-blue-300" },
    green: { bg: "bg-gradient-to-br from-green-900 to-emerald-900", icon: "bg-gradient-to-br from-green-800 to-emerald-800 text-green-300" },
    red: { bg: "bg-gradient-to-br from-red-900 to-rose-900", icon: "bg-gradient-to-br from-red-800 to-rose-800 text-red-300" },
    yellow: { bg: "bg-gradient-to-br from-amber-900 to-yellow-900", icon: "bg-gradient-to-br from-amber-800 to-yellow-800 text-amber-300" },
  };
  const c = colorMap[color] || colorMap.blue;

  const content = (
    <div className={`${c.bg} p-5 sm:p-7 rounded-2xl shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default`}>
      <div className={`${c.icon} p-4 rounded-xl shadow-sm w-fit`}>
        {Icon && <Icon size={32} className="font-bold" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-black text-white break-words">{value}</h3>
        {hint && <p className="mt-2 text-sm text-gray-200/80">{hint}</p>}
      </div>
      {to && (
        <div className="self-end sm:self-center rounded-full bg-white/10 p-2 text-white/90">
          <ArrowUpRight size={18} />
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
};
