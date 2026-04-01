import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Users, CreditCard, FileText, LogOut, Menu, UserCircle } from 'lucide-react';

export const MainLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Allowances', path: '/allowances', icon: CreditCard },
    { name: 'Deductions', path: '/deductions', icon: CreditCard },
    { name: 'Payroll', path: '/payroll', icon: FileText },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r transition-all duration-300 flex flex-col`}>
        <div className="p-6 text-xl font-black text-blue-600 truncate">PAYROLL APP</div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${location.pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <item.icon size={22} />
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
          <div className="text-gray-400 font-bold hidden md:block uppercase tracking-widest">Payroll Management System</div>
          <div className="relative group">
            <button className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
              <span className="font-bold">{user?.username || 'Admin'}</span>
              <UserCircle size={28} className="text-gray-400" />
            </button>
            <div className="absolute right-0 w-48 bg-white border rounded-xl shadow-xl hidden group-hover:block z-50 p-2">
              <button onClick={logout} className="w-full text-left p-3 flex items-center gap-2 text-red-500 hover:bg-red-50 rounded-lg">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};