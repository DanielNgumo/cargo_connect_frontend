import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Check, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [userType, setUserType] = useState<'shipper' | 'agent'>('shipper');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  // In your SignUp component, update the fetch URLs:

const handleSignupSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  // Log signup attempt
  console.log('Signup attempt', {
    email,
    user_type: userType,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await fetch(
      'http://127.0.0.1:8000/api/signup', // Use full URL
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Add Accept header
        },
        // Remove credentials: 'include' for now since we're not using CSRF for API
        body: JSON.stringify({
          name,
          email,
          phone_number: phoneNumber,
          password,
          password_confirmation: passwordConfirmation,
          user_type: userType,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    // Log successful signup
    console.log('Signup successful', {
      email,
      user_type: userType,
      timestamp: new Date().toISOString(),
    });

    // Show success toast
    toast.success('Signup successful! Please enter the OTP sent to your email.', {
      position: 'top-right',
      autoClose: 5000,
    });

    // Show OTP input field
    setShowOtp(true);
  } catch (err: any) {
    // Log error
    console.error('Signup error', {
      error: err.message,
      email,
      user_type: userType,
      timestamp: new Date().toISOString(),
    });

    // Set error state for form display
    setError(err.message || 'An error occurred during signup');

    // Show error toast
    toast.error(err.message || 'An error occurred during signup', {
      position: 'top-right',
      autoClose: 5000,
    });
  } finally {
    setLoading(false);
  }
};

const handleOtpSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  // Log OTP verification attempt
  console.log('OTP verification attempt', {
    email,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await fetch(
      'http://127.0.0.1:8000/api/verify-otp', // Use full URL
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Add Accept header
        },
        // Remove credentials: 'include' for now
        body: JSON.stringify({ email, code: otp }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    // Log successful OTP verification
    console.log('OTP verification successful', {
      email,
      timestamp: new Date().toISOString(),
    });

    // Store token (if returned)
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    // Show success toast
    toast.success('OTP verified successfully! Redirecting...', {
      position: 'top-right',
      autoClose: 5000,
    });

    // Delay navigation to allow toast to be visible
    setTimeout(() => {
      navigate('/');
    }, 3000); // 3-second delay before navigation
  } catch (err: any) {
    // Log error
    console.error('OTP verification error', {
      error: err.message,
      email,
      timestamp: new Date().toISOString(),
    });

    // Set error state for form display
    setError(err.message || 'An error occurred during OTP verification');

    // Show error toast
    toast.error(err.message || 'An error occurred during OTP verification', {
      position: 'top-right',
      autoClose: 5000,
    });
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Toast Container */}
      <ToastContainer />

      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <User className="w-4 h-4" />
            <span>{showOtp ? 'Verify OTP' : 'Create Account'}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {showOtp ? 'Verify Your Email' : 'Join '}
            {!showOtp && (
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CargoLink
              </span>
            )}
          </h2>
          <p className="text-gray-600 mt-2">
            {showOtp ? 'Enter the OTP sent to your email.' : 'Get started in minutes as a shipper or agent.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {!showOtp ? (
          <>
            {/* User Type Toggle */}
            <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg mb-6 w-full justify-center">
              <button
                onClick={() => setUserType('shipper')}
                disabled={loading}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  userType === 'shipper'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                For Shippers
              </button>
              <button
                onClick={() => setUserType('agent')}
                disabled={loading}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  userType === 'agent'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                For Agents
              </button>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    id="phone_number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    id="password_confirmation"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  disabled={loading}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-800">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-800">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={!agreedToTerms || loading}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
                  agreedToTerms && !loading
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>{loading ? 'Signing up...' : 'Sign Up'}</span>
                {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  Already have an account? Sign In
                </Link>
              </div>
            </form>
          </>
        ) : (
          /* OTP Form */
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                OTP Code
              </label>
              <div className="relative">
                <Check className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="123456"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105'
              }`}
            >
              <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
              {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="text-center">
              <button
                onClick={() => {
                  setShowOtp(false);
                  setOtp('');
                  setError('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Back to Signup
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: -2s;
        }
      `}</style>
    </div>
  );
};

export default SignUp;