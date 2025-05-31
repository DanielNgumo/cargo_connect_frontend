import { ChevronRight, Ship, Plane, Package } from 'lucide-react';

const CTA = () => {
  return (
    <div id="cta" className="relative py-20 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/5 animate-float">
          <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center">
            <Ship className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="absolute bottom-1/4 right-1/5 animate-float animation-delay-1000">
          <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center">
            <Plane className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Header */}
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Package className="w-4 h-4" />
          <span>Take Action Now</span>
        </div>
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Start Saving with{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CargoLink
          </span>{' '}
          Today
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Join thousands of businesses and agents reducing shipping costs by up to 50% with our smart cargo aggregation platform. Get started in minutes!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold flex items-center justify-center space-x-2">
            <span>Get Started</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="group bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-full hover:bg-white hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2">
            <span>Contact Sales</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </button>
        </div>
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
        .animation-delay-1000 {
          animation-delay: -1s;
        }
      `}</style>
    </div>
  );
};

export default CTA;