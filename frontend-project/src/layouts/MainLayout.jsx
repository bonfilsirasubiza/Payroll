import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Users, CreditCard, FileText, LogOut, Menu, UserCircle } from 'lucide-react';

export const MainLayout = ({ children }) => {
  const [isDesktopSidebarExpanded, setDesktopSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const displayName = user?.username || user?.fullName || user?.name || 'Admin';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Allowances', path: '/allowances', icon: CreditCard },
    { name: 'Deductions', path: '/deductions', icon: CreditCard },
    { name: 'Payroll', path: '/payroll', icon: FileText },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  useEffect(() => {
    setMobileSidebarOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleMenuToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setDesktopSidebarExpanded((prev) => !prev);
      return;
    }

    setMobileSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 -translate-x-full bg-gray-900 border-r border-gray-700 transition-all duration-300 flex flex-col lg:static lg:translate-x-0 lg:shrink-0 ${isMobileSidebarOpen ? 'translate-x-0' : ''} ${isDesktopSidebarExpanded ? 'lg:w-64' : 'lg:w-20'}`}>
        <div className="p-5 sm:p-6 text-xl font-black text-blue-400 truncate">PAYROLL APP</div>
        <nav className="flex-1 px-3 sm:px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${location.pathname === item.path ? 'bg-blue-900 text-blue-400' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <item.icon size={22} />
              <span className={`font-medium block ${isDesktopSidebarExpanded ? 'lg:block' : 'lg:hidden'}`}>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex min-h-0 flex-col">
        {/* Navbar */}
        <header className="sticky top-0 z-20 min-h-16 flex-none bg-gray-900/95 border-b border-gray-700 px-4 sm:px-6 lg:px-8 py-3 backdrop-blur-sm flex items-center justify-between gap-3">
          <button onClick={handleMenuToggle} className="p-2 hover:bg-gray-700 rounded-lg">
            <Menu size={24} />
          </button>
          <div className="text-gray-300 font-bold hidden md:block uppercase tracking-[0.2em] text-center flex-1">Payroll Management System</div>
          <div className="relative">
            <button className="p-2 hover:bg-gray-700 rounded-lg" aria-label="User menu" onClick={() => setUserMenuOpen((prev) => !prev)}>
              <UserCircle size={28} className="text-gray-300" />
            </button>
            <div className={`absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 p-2 ${isUserMenuOpen ? 'block' : 'hidden'}`}>
              <div className="px-3 py-2 mb-1 border-b border-gray-700">
                <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Logged In</p>
                <p className="text-sm font-bold text-white mt-1 truncate">{displayName}</p>
              </div>
              <button onClick={logout} className="w-full text-left p-3 flex items-center gap-2 text-red-400 hover:bg-red-900 rounded-lg">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
      </div>
    </div>
  );
};
