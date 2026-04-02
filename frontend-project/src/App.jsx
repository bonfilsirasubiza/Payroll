import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Allowances } from './pages/Allowances';
import { Deductions } from './pages/Deductions';
import { Payroll } from './pages/Payroll';
import { Reports } from './pages/Reports';
import { About } from './pages/About';
import { MainLayout } from './layouts/MainLayout';
import { ToastProvider } from './components/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/employees" element={<MainLayout><Employees /></MainLayout>} />
          <Route path="/allowances" element={<MainLayout><Allowances /></MainLayout>} />
          <Route path="/deductions" element={<MainLayout><Deductions /></MainLayout>} />
          <Route path="/payroll" element={<MainLayout><Payroll /></MainLayout>} />
          <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />

          {/* Redirect unknown routes to Login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
