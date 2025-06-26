import { useState, useEffect } from 'react';
import { Menu, X, Ship, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userType, setUserType] = useState<string | null>(localStorage.getItem('user_type'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
      await axios.post('/api/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        withCredentials: true,
      });
      localStorage.removeItem('authToken');
      localStorage.removeItem('user_type');
      setUserType(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const renderNavLinks = () => {
    if (!userType) {
      return (
        <>
          <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Home</a>
          <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">How It Works</a>
          <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Pricing</a>
          <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">About</a>
          <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Login</Link>
          <Link
            to="/signup"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
          >
            Get Started
          </Link>
        </>
      );
    }

    switch (userType) {
      case 'admin':
        return (
          <>
            <Link to="/admin" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Dashboard</Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </>
        );
      case 'agent':
        return (
          <>
            <Link to="/bids" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">My Bids</Link>
            <Link to="/create-route" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Create Route</Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </>
        );
      case 'shipper':
        return (
          <>
            <Link to="/shipper/book-shipment" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Book Shipment</Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Ship className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CargoLink
            </span>
          </div>
          <div className="hidden lg:flex items-center space-x-8">
            {renderNavLinks()}
          </div>
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {renderNavLinks()}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;