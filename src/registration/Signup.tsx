import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Check, ChevronRight, Building, Contact } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import PhoneInput from 'react-phone-input-2';
import 'react-toastify/dist/ReactToastify.css';
import 'react-phone-input-2/lib/style.css';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [userType, setUserType] = useState<'shipper' | 'agent'>('shipper');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Log signup attempt
    console.log('Signup attempt', {
      email,
      phone_number: phoneNumber,
      user_type: userType,
      timestamp: new Date().toISOString(),
    });

    // Frontend validation
    if (!phoneNumber || phoneNumber.length < 7) {
      setError('Please enter a valid phone number');
      setLoading(false);
      toast.error('Please enter a valid phone number', { position: 'top-right', autoClose: 5000 });
      return;
    }

    if (userType === 'agent') {
      if (!businessRegistrationNumber.trim()) {
        setError('Business registration number is required for agents');
        setLoading(false);
        toast.error('Business registration number is required for agents', { position: 'top-right', autoClose: 5000 });
        return;
      }
      if (!contactPerson.trim()) {
        setError('Contact person is required for agents');
        setLoading(false);
        toast.error('Contact person is required for agents', { position: 'top-right', autoClose: 5000 });
        return;
      }
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone_number: `+${phoneNumber.replace(/^\+/, '')}`,
          password,
          password_confirmation: passwordConfirmation,
          user_type: userType,
          business_registration_number: userType === 'agent' ? businessRegistrationNumber : null,
          contact_person: userType === 'agent' ? contactPerson : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || data.errors
          ? Object.values(data.errors).flat().join(', ')
          : 'Signup failed';
        throw new Error(errorMessage);
      }

      console.log('Signup successful', {
        email,
        phone_number: phoneNumber,
        user_type: userType,
        timestamp: new Date().toISOString(),
      });

      toast.success('Signup successful! Please enter the OTP sent to your email.', {
        position: 'top-right',
        autoClose: 5000,
      });

      setShowOtp(true);
    } catch (err: any) {
      console.error('Signup error', {
        error: err.message,
        email,
        phone_number: phoneNumber,
        user_type: userType,
        timestamp: new Date().toISOString(),
      });

      setError(err.message || 'An error occurred during signup');
      toast.error(err.message || 'An error occurred during signup', { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('OTP verification attempt', {
      email,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await fetch('http://127.0.0.1:8000/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || data.errors
          ? Object.values(data.errors).flat().join(', ')
          : 'OTP verification failed';
        throw new Error(errorMessage);
      }

      console.log('OTP verification successful', {
        email,
        timestamp: new Date().toISOString(),
      });

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      toast.success('OTP verified successfully! Redirecting...', {
        position: 'top-right',
        autoClose: 5000,
      });

      setTimeout(() => {
        navigate(userType === 'agent' && !data.user.is_approved ? '/pending-approval' : '/');
      }, 3000);
    } catch (err: any) {
      console.error('OTP verification error', {
        error: err.message,
        email,
        timestamp: new Date().toISOString(),
      });

      setError(err.message || 'An error occurred during OTP verification');
      toast.error(err.message || 'An error occurred during OTP verification', { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <ToastContainer />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
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

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {!showOtp ? (
          <>
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
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                  <PhoneInput
                    country={'us'}
                    value={phoneNumber}
                    onChange={(value) => setPhoneNumber(value)}
                    disabled={loading}
                    enableSearch={true}
                    searchPlaceholder="Search country"
                    inputProps={{
                      id: 'phone_number',
                      required: true,
                    }}
                    containerClass="w-full"
                    inputClass={`w-full pl-12 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${loading ? 'bg-gray-100' : ''}`}
                    buttonClass="border-gray-200"
                    dropdownClass="rounded-lg shadow-lg"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {userType === 'agent' && (
                <>
                  <div>
                    <label htmlFor="business_registration_number" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Registration Number
                    </label>
                    <div className="relative">
                      <Building className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        id="text"
                        type="business_registration_number"
                        value={businessRegistrationNumber}
                        onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        placeholder="e.g., ABC123456"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact_person" className="block" text-sm="" font-medium="" text-gray-700="" mb-1="">
                      Contact Person
                    </label>
                    <div className="relative">
                      <Contact className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        id="contact_person"
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        placeholder="e.g., Jane Doe"
                      />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label htmlFor="password" className="block" text-sm="" font-medium="" text-gray-700="" mb-1="">
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
                    className="w-full pl-80 p-3 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                  className="w-full pl-10 p-3 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="e.g., 123456"
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

      <style>
        {`
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
          .react-tel-input .flag-dropdown {
            background-color: transparent;
            border: none;
          }
          .react-tel-input .selected-flag {
            padding-left: 40px;
          }
          .react-tel-input .search {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          .react-tel-input .search input {
            width: 100%;
            padding: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            outline: none;
            font-size: 14px;
          }
          .react-tel-input .search input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
          }
        `}
      </style>
    </div>
  );
};

export default SignUp;