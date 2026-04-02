import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useToast } from '../components/ToastProvider';
import axiosInstance from '../api/axiosInstance';
import { getApiErrorMessage } from '../utils/apiError';
import { isStrongPassword, PASSWORD_STRENGTH_MESSAGE } from '../utils/passwordStrength';

export const Register = () => {
  const navigate = useNavigate();
  const { showLoading, showSuccess, showError } = useToast();
  
  // 1. Form State (Confirm Password removed)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: ''
  });
  
  // 2. UI States for UX
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // 3. API Submission Logic
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!isStrongPassword(formData.password)) {
      setError(PASSWORD_STRENGTH_MESSAGE);
      showError(PASSWORD_STRENGTH_MESSAGE);
      return;
    }

    setIsLoading(true);
    showLoading('Creating your account...');

    try {
      // Connects to your Node.js Backend
      const response = await axiosInstance.post('/users/register', {
        fullName: formData.fullName,
        username: formData.username,
        password: formData.password
      });

      // If backend saves successfully:
      if (response.status === 201 || response.status === 200) {
        showSuccess('Account created successfully. Please log in.');
        navigate('/'); // Redirect back to Login page
      }
    } catch (err) {
      // Capture error messages sent from your Express backend
      const errorMessage = getApiErrorMessage(err, 'Failed to register. Username might already exist.');
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 w-80 h-80 bg-emerald-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      
      <div className="relative z-10 bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700 backdrop-blur-sm">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-black text-white">✓</span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Create Account</h2>
          <p className="text-slate-300 text-sm mt-2 font-medium">Register as administrator</p>
        </div>

        {/* Error Display Box */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold rounded-r-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <Input 
            id="fullName" 
            label="Full Name" 
            value={formData.fullName} 
            onChange={handleChange} 
            required 
          />
          <Input 
            id="username" 
            label="Username" 
            value={formData.username} 
            onChange={handleChange} 
            required 
          />
          <Input 
            id="password" 
            label="Password" 
            type="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
          <p className="text-xs text-slate-400 -mt-3">
            {PASSWORD_STRENGTH_MESSAGE}
          </p>
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isLoading}
            className="mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-600 text-center">
          <p className="text-sm text-slate-300">
            Already have an account? <Link to="/" className="text-emerald-400 font-bold hover:text-teal-400 transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
