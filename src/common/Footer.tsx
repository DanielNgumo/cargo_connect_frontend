import { Ship, Mail, Phone, Twitter, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
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
            <p className="text-gray-400 text-sm">
              Revolutionizing shipping with smart cargo aggregation. Save up to 50% on air and sea freight with our global network.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-blue-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-blue-400 transition-colors">How It Works</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-blue-400 transition-colors">Testimonials</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-blue-400 transition-colors">Pricing</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-blue-400 transition-colors">About</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">support@cargolink.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">+1 (800) 123-4567</span>
              </li>
              <li className="text-gray-400">
                123 Logistics Park, Suite 100<br />
                London, UK
              </li>
            </ul>
          </div>

          {/* Social Media & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Subscribe to our newsletter</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-2 rounded-l-full bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-r-full hover:shadow-lg transition-all">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} CargoLink. All rights reserved.
          </p>
          <div className="flex space-x-4 text-sm">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;