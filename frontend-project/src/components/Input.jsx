import React from 'react';

export const Input = ({ label, id, type = "text", ...props }) => (
  <div className="relative mb-6">
    <input
      type={type}
      id={id}
      {...props}
      placeholder=" " 
      className="peer block w-full rounded-xl border border-gray-300 bg-transparent px-4 pb-3 pt-4 text-sm font-medium text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 transition-all"
    />
    <label
      htmlFor={id}
      className="absolute left-3 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm font-bold text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
    >
      {label}
    </label>
  </div>
);