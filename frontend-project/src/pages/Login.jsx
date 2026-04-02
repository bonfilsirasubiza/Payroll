import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useToast } from '../components/ToastProvider';
import axiosInstance from '../api/axiosInstance';
import { getApiErrorMessage } from '../utils/apiError';
import { PASSWORD_STRENGTH_MESSAGE } from '../utils/passwordStrength';

export const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showLoading, showSuccess, showError } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    showLoading('Signing you in...');

    try {
      const res = await axiosInstance.post('/users/login', credentials);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      showSuccess('Login successful.');
      navigate('/dashboard');
    } catch (err) {
      showError(getApiErrorMessage(err, 'Invalid credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-1/2 w-80 h-80 bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      
      <div className="relative z-10 bg-gray-800 p-12 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700 backdrop-blur-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl font-black text-white">HP</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Admin</h1>
          <h2 className="text-sm font-bold text-slate-300 mt-1 uppercase tracking-widest">Payroll Management</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto mt-4"></div>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <Input label="Username" onChange={e => setCredentials({...credentials, username: e.target.value})} required />
          <Input label="Password" type="password" onChange={e => setCredentials({...credentials, password: e.target.value})} required />
          <p className="text-xs text-slate-400 -mt-4">
            {PASSWORD_STRENGTH_MESSAGE}
          </p>
          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-8 pt-8 border-t border-slate-600 text-center">
          <p className="text-sm text-slate-300">
            Don't have an account? <Link to="/register" className="text-blue-400 font-bold hover:text-indigo-400 transition-colors">Create one</Link>
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400 font-medium">Protected System • Authorized Access Only</p>
      </div>
    </div>
  );
};
