import React from 'react';
import { MainLayout } from '../layouts/MainLayout';

export const About = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
          <div className="flex flex-col justify-center gap-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">About HotelPro Payroll</h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              HotelPro Payroll is a lightweight, secure payroll management system designed for hospitality teams. 
              It streamlines employee records, allowances, deductions, and payroll disbursements so administrators
              can produce accurate reports and exportable payroll data quickly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-700">Reliable</h3>
                <p className="text-xs text-gray-500">Robust backend with MongoDB and secure JWT auth.</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700">Fast</h3>
                <p className="text-xs text-gray-500">Optimized frontend with Vite and client-side caching patterns.</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700">Exportable</h3>
                <p className="text-xs text-gray-500">Export payrolls and reports to CSV for accounting workflows.</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700">Responsive</h3>
                <p className="text-xs text-gray-500">Layouts adapt to mobile, tablet, and desktop screens.</p>
              </div>
            </div>

            <div className="mt-4">
              <a href="/reports" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-700">View Reports</a>
              <a href="/dashboard" className="ml-3 inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">Go to Dashboard</a>
            </div>
          </div>

          <div className="p-4 flex items-center justify-center">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
              <img src="/public/illustration-about.png" alt="About illustration" className="w-full h-auto max-h-96 object-contain" onError={(e)=>{e.target.style.display='none'}} />
              <div className="mt-4 text-gray-500 text-sm">
                Built with modern web technologies and developer-friendly patterns.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
            © {new Date().getFullYear()} HotelPro Payroll — Designed to make payroll simple and auditable.
          </div>
        </div>
      </div>
    </div>
  );
};
