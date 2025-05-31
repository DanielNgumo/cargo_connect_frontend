import React, { useState, useEffect } from 'react';
import { Ship, Plane, Package, Users, TrendingDown, Globe, ChevronRight, Star, Shield, Clock } from 'lucide-react';


const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  
  type FeatureColor = 'blue' | 'purple' | 'green' | 'orange' | 'indigo' | 'teal';

  interface Feature {
    icon: React.ElementType;
    title: string;
    description: string;
    details: string[];
    color: FeatureColor;
  }

  const features: Feature[] = [
    {
      icon: TrendingDown,
      title: "Smart Cargo Aggregation",
      description: "Join group shipments and save up to 50% on shipping costs through our intelligent cargo consolidation system.",
      details: [
        "Real-time cargo pooling with other shippers",
        "Dynamic pricing that decreases as more cargo joins",
        "Automated best route and agent selection",
        "Live tracking of aggregation progress"
      ],
      color: "blue"
    },
    {
      icon: Shield,
      title: "Gold Agent Network",
      description: "Access our vetted network of premium shipping agents offering the best rates and guaranteed reliable service.",
      details: [
        "Pre-screened and verified shipping partners",
        "Live price comparison across agents",
        "Guaranteed service quality standards",
        "24/7 customer support coverage"
      ],
      color: "purple"
    },
    {
      icon: Globe,
      title: "Global Route Coverage",
      description: "Ship anywhere in the world with our extensive network covering major trade routes via air and sea freight.",
      details: [
        "45+ international shipping routes",
        "Both air and sea freight options",
        "Major ports and airports coverage",
        "Customs clearance assistance"
      ],
      color: "green"
    },
    {
      icon: Clock,
      title: "Real-Time Tracking",
      description: "Track your cargo from pickup to delivery with real-time updates and transparent pricing throughout the journey.",
      details: [
        "Live cargo location tracking",
        "Instant status notifications",
        "Transparent cost breakdown",
        "Estimated delivery timeframes"
      ],
      color: "orange"
    },
    {
      icon: Users,
      title: "Community Benefits",
      description: "Join a growing community of smart shippers and benefit from collective bargaining power and shared savings.",
      details: [
        "Group buying power for better rates",
        "Community-driven route optimization",
        "Shared shipping experiences and tips",
        "Loyalty rewards and referral bonuses"
      ],
      color: "indigo"
    },
    {
      icon: Package,
      title: "Flexible Shipping Options",
      description: "Choose from various shipping modes and get personalized solutions that fit your timeline and budget requirements.",
      details: [
        "Air freight for urgent deliveries",
        "Sea freight for cost-effective shipping",
        "Mixed cargo types support",
        "Custom packaging solutions"
      ],
      color: "teal"
    }
  ];

  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      accent: "bg-blue-600",
      gradient: "from-blue-600 to-blue-700"
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      accent: "bg-purple-600",
      gradient: "from-purple-600 to-purple-700"
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      accent: "bg-green-600",
      gradient: "from-green-600 to-green-700"
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      accent: "bg-orange-600",
      gradient: "from-orange-600 to-orange-700"
    },
    indigo: {
      bg: "bg-indigo-50",
      icon: "text-indigo-600",
      accent: "bg-indigo-600",
      gradient: "from-indigo-600 to-indigo-700"
    },
    teal: {
      bg: "bg-teal-50",
      icon: "text-teal-600",
      accent: "bg-teal-600",
      gradient: "from-teal-600 to-teal-700"
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="features" className="relative py-20 bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            <span>Powerful Features</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ship Smarter
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge technology with a global network of trusted partners 
              const colors = colorClasses[feature.color as FeatureColor];
          </p>
        </div>

        {/* Interactive Features Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Feature Cards */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colors = colorClasses[feature.color];
              const isActive = activeFeature === index;
              
              return (
                <div
                  key={index}
                  className={`group cursor-pointer transition-all duration-500 ${
                    isActive ? 'transform scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isActive 
                      ? `${colors.bg} border-${feature.color}-200 shadow-xl` 
                      : 'bg-gray-50 border-gray-100 hover:border-gray-200 hover:shadow-lg'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive ? colors.accent : 'bg-white'
                      }`}>
                        <Icon className={`w-6 h-6 transition-colors duration-300 ${
                          isActive ? 'text-white' : colors.icon
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {feature.description}
                        </p>
                        {isActive && (
                          <div className="space-y-2 animate-fadeIn">
                            {feature.details.map((detail, idx) => (
                              <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                                <div className={`w-1.5 h-1.5 rounded-full ${colors.accent}`}></div>
                                <span>{detail}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-all duration-300 ${
                        isActive ? `${colors.icon} rotate-90` : 'text-gray-400 group-hover:text-gray-600'
                      }`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Visualization */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-2xl">
              {/* Main Display */}
              <div className={`bg-gradient-to-r ${colorClasses[features[activeFeature].color].gradient} rounded-2xl p-6 text-white mb-6 transition-all duration-500`}>
                <div className="flex items-center space-x-3 mb-4">
                  {React.createElement(features[activeFeature].icon, { className: "w-8 h-8" })}
                  <h3 className="text-2xl font-bold">{features[activeFeature].title}</h3>
                </div>
                <p className="text-white/90 mb-4">{features[activeFeature].description}</p>
                
                {/* Interactive Demo Based on Feature */}
                {activeFeature === 0 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Current Aggregation</span>
                      <span className="text-sm font-bold">15.2 CBM</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                      <div className="bg-white h-2 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                    <div className="text-xs text-white/80">12 shippers joined • $45/CBM (was $90)</div>
                  </div>
                )}
                
                {activeFeature === 1 && (
                  <div className="space-y-3">
                    {['Gold Agent A', 'Gold Agent B', 'Gold Agent C'].map((agent, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-sm">{agent}</span>
                        </div>
                        <span className="text-sm font-bold">${45 + idx * 5}/CBM</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeFeature === 2 && (
                  <div className="grid grid-cols-3 gap-2">
                    {['Lagos→London', 'Dubai→NYC', 'HK→Berlin', 'Tokyo→LA', 'Mumbai→Paris', 'More...'].map((route, idx) => (
                      <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                        <div className="text-xs font-medium">{route}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeFeature === 3 && (
                  <div className="space-y-2">
                    {[
                      { status: 'Picked up', time: '2 hours ago', active: false },
                      { status: 'At warehouse', time: '1 hour ago', active: false },
                      { status: 'In transit', time: '30 min ago', active: true },
                      { status: 'Delivered', time: 'Est. 2 days', active: false }
                    ].map((item, idx) => (
                      <div key={idx} className={`flex items-center space-x-3 ${item.active ? 'text-white' : 'text-white/60'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-white animate-pulse' : 'bg-white/40'}`}></div>
                        <span className="text-sm flex-1">{item.status}</span>
                        <span className="text-xs">{item.time}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeFeature === 4 && (
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">500+</div>
                    <div className="text-sm text-white/80 mb-3">Active Community Members</div>
                    <div className="flex justify-center space-x-2">
                      {[1,2,3,4,5].map((_, idx) => (
                        <div key={idx} className="w-8 h-8 bg-white/20 rounded-full animate-pulse" style={{animationDelay: `${idx * 200}ms`}}></div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeFeature === 5 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                      <Plane className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-xs">Air Freight</div>
                      <div className="text-sm font-bold">1-3 days</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                      <Ship className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-xs">Sea Freight</div>
                      <div className="text-sm font-bold">2-6 weeks</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Indicators */}
              <div className="flex justify-center space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeFeature === index 
                        ? colorClasses[features[index].color].accent 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 animate-float">
              <div className="text-2xl font-bold text-green-600">50%</div>
              <div className="text-sm text-gray-600">Avg. Savings</div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 animate-float animation-delay-1000">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Shipping?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of businesses already saving money with our smart cargo aggregation platform.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold">
              Start Your Free Trial Today
            </button>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Features;