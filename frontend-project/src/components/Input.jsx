import React from 'react';

export const Input = ({ label, id, type = "text", ...props }) => (
  <div className="relative mb-5">
    <input
      type={type}
      id={id}
      {...props}
      placeholder=" " 
      className="peer block w-full rounded-xl border border-gray-200 bg-gray-50 hover:bg-white px-4 pb-3 pt-4 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 focus:bg-white read-only:bg-gray-100 read-only:text-gray-600 read-only:cursor-not-allowed"
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-gray-50 px-2 text-xs font-bold text-gray-600 duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600 peer-focus:bg-white transition-colors"
    >
      {label}
    </label>
  </div>
);
