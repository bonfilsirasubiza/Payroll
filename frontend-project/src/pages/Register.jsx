import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import axiosInstance from '../api/axiosInstance';

export const Register = () => {
  const navigate = useNavigate();
  
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
    setIsLoading(true);

    try {
      // Connects to your Node.js Backend
      const response = await axiosInstance.post('/users/register', {
        fullName: formData.fullName,
        username: formData.username,
        password: formData.password
      });

      // If backend saves successfully:
      if (response.status === 201 || response.status === 200) {
        alert("Account created successfully! Please log in.");
        navigate('/'); // Redirect back to Login page
      }
    } catch (err) {
      // Capture error messages sent from your Express backend
      setError(
        err.response?.data?.message || 
        "Failed to register. Username might already exist."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Sign Up</h2>
          <p className="text-gray-400 text-sm mt-2">Create a new administrator account</p>
        </div>

        {/* Error Display Box */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
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
          
          <Button 
            variant="secondary" 
            type="submit" 
            className="mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Admin Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/" className="text-blue-600 font-bold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};