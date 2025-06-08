import React, { useState } from 'react';
import { Mail, Lock, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Login attempt', { email, timestamp: new Date().toISOString() });

    try {
      await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
      const response = await axios.post('/api/login', { login: email, password }, {
        headers: { 'Accept': 'application/json' },
        withCredentials: true,
      });

      const data = response.data;
      console.log('Login response:', { data, token: data.token });

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user_type', data.user.user_type);
      console.log('Stored authToken:', localStorage.getItem('authToken'));

      toast.success('Login successful! Redirecting...', {
        position: 'top-right',
        autoClose: 3000,
      });

      setTimeout(() => {
        if (data.user.user_type === 'admin') {
          navigate('/admin');
        } else if (data.user.user_type === 'agent') {
          if (!data.user.is_approved) {
            navigate('/pending-approval');
          } else {
            navigate('/create-route');
          }
        } else if (data.user.user_type === 'shipper') {
          navigate('/book-shipment');
        }
      }, 500);
    } catch (err: any) {
      console.error('Login error', {
        error: err.response?.data?.message || err.message,
        status: err.response?.status,
        email,
        timestamp: new Date().toISOString(),
      });

      setError(err.response?.data?.message || 'An error occurred during login');
      toast.error('Login failed: ' + (err.response?.data?.message || err.message), {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <ToastContainer />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-transparent rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-transparent rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>
      <div className="relative max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Lock className="w-4 h-4" />
            <span>Login</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome Back to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CargoLink
            </span>
          </h2>
          <p className="text-gray-600 mt-2">Access your platform to start shipping smarter.</p>
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 pr-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 pr-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="password"
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              Forgot Password?
            </a>
            <Link to="/signup" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              Need an account? Sign Up
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span>{loading ? 'Logging in...' : 'Login'}</span>
            {!loading && <ChevronRight className="w-5 h-5 group-hover:animate-pulse transition-transform" />}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 0s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: -2s;
        }
      `}</style>
    </div>
  );
};

export default Login;