import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import axiosInstance from '../api/axiosInstance';

export const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/users/login', credentials);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Sign In</h2>
          <p className="text-gray-400 text-sm mt-2">Enter your admin credentials</p>
        </div>
        <form onSubmit={handleLogin}>
          <Input label="Username" onChange={e => setCredentials({...credentials, username: e.target.value})} required />
          <Input label="Password" type="password" onChange={e => setCredentials({...credentials, password: e.target.value})} required />
          <Button variant="primary" type="submit" className="mt-4">Login to Dashboard</Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          New Admin? <Link to="/register" className="text-green-600 font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
};