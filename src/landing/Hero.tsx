import  { useState, useEffect } from 'react';
import {  Ship, Plane, Package, Users, TrendingDown, Globe, ChevronRight, Star, Shield, Clock } from 'lucide-react';

const Hero = () => {
  const [currentStat, setCurrentStat] = useState(0);
  
  const stats = [
    { number: "50%", label: "Average Savings", icon: TrendingDown },
    { number: "10K+", label: "Shipments Sent", icon: Package },
    { number: "500+", label: "Happy Customers", icon: Users },
    { number: "99.9%", label: "Delivery Success", icon: Shield }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 animate-float">
          <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center">
            <Ship className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float animation-delay-1000">
          <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center">
            <Plane className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div className="absolute bottom-1/4 left-1/3 animate-float animation-delay-2000">
          <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-lg">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Trusted by 500+ businesses worldwide</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Ship Smarter,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Save More
              </span>
              <br />
              with Cargo Aggregation
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join thousands of businesses reducing shipping costs by up to 50% through our intelligent cargo aggregation platform. 
              Ship via air or sea with guaranteed best prices.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold flex items-center justify-center space-x-2">
                <span>Start Shipping Now</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-full hover:bg-white hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2">
                <span>Watch Demo</span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </button>
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index}
                    className={`bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center transform transition-all duration-500 ${
                      currentStat === index ? 'scale-105 shadow-lg bg-white/80' : 'hover:scale-102'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      currentStat === index ? 'text-blue-600' : 'text-gray-500'
                    } transition-colors`} />
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            {/* Main Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Clock className="w-4 h-4" />
                  <span>Live Aggregation</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Current Best Rate</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Ship className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-semibold">Sea Freight</div>
                      <div className="text-sm text-gray-600">Lagos → London</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">$45</div>
                    <div className="text-sm text-gray-500 line-through">$90</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Plane className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="font-semibold">Air Freight</div>
                      <div className="text-sm text-gray-600">Lagos → London</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">$12</div>
                    <div className="text-sm text-gray-500 line-through">$25</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl text-center">
                  <div className="text-sm font-medium mb-1">Total Savings Today</div>
                  <div className="text-3xl font-bold">52%</div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg animate-float">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm font-semibold">12 Shippers</div>
                  <div className="text-xs text-gray-600">Joined today</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg animate-float animation-delay-1000">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-sm font-semibold">45 Routes</div>
                  <div className="text-xs text-gray-600">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
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
        .animation-delay-2000 {
          animation-delay: -2s;
        }
        .animation-delay-4000 {
          animation-delay: -4s;
        }
      `}</style>
    </div>
  );
};



export default Hero;