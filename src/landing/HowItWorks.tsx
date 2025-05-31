import React, { useState, useEffect } from 'react';
import { Ship, Plane, Package, Users, TrendingDown, Globe, ChevronRight, Star, Shield, Clock } from 'lucide-react';


const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [userType, setUserType] = useState('shipper'); // 'shipper' or 'agent'

  const shipperSteps: {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
    details: string[];
    demo: Demo;
  }[] = [
    {
      id: 1,
      title: "Create Account & Get Started",
      description: "Sign up in minutes with your business details and verify your account via OTP",
      icon: Users,
      details: [
        "Quick registration with name, email, and phone",
        "Choose 'Shipper' as your user type",
        "Instant OTP verification via email",
        "Access your personalized dashboard"
      ],
      demo: {
        type: "form",
        content: {
          title: "Welcome to CargoLink",
          fields: ["Full Name", "Email Address", "Phone Number", "Password"],
          cta: "Create Account"
        }
      }
    },
    {
      id: 2,
      title: "Select Route & Shipping Mode",
      description: "Choose your origin and destination, then pick between air or sea freight based on your timeline",
      icon: Globe,
      details: [
        "Enter 'From' and 'To' locations",
        "Select Air freight (1-3 days) or Sea freight (2-6 weeks)",
        "View available routes and pricing",
        "See live aggregation opportunities"
      ],
      demo: {
        type: "selector",
        content: {
          from: "Lagos, Nigeria",
          to: "London, UK",
          modes: [
            { type: "Air", price: "$12/kg", time: "1-3 days", active: true },
            { type: "Sea", price: "$45/CBM", time: "2-6 weeks", active: false }
          ]
        }
      }
    },
    {
      id: 3,
      title: "Choose Your Gold Agent",
      description: "Our system pre-selects the best agent with live pricing, or browse other verified options",
      icon: Star,
      details: [
        "Top Gold Agent auto-selected for best rates",
        "See live aggregation campaigns and savings",
        "Browse alternative agents if preferred",
        "Get gentle nudges for optimal choices"
      ],
      demo: {
        type: "agents",
        content: {
          recommended: {
            name: "Premium Cargo Ltd",
            badge: "Best Choice Today!",
            price: "$45/CBM",
            savings: "52% savings",
            aggregation: "12 shippers joined"
          },
          alternatives: [
            { name: "Swift Logistics", price: "$65/CBM", status: "No aggregation" },
            { name: "Global Express", price: "$70/CBM", status: "Standard rate" }
          ]
        }
      }
    },
    {
      id: 4,
      title: "Get Your Aggregation Code",
      description: "Receive your unique discount code, shipping label, and warehouse address instantly",
      icon: Package,
      details: [
        "System generates unique aggregation code",
        "Download shipping label with all details",
        "Get foreign warehouse address",
        "Share details with your supplier"
      ],
      demo: {
        type: "code",
        content: {
          code: "AGG-2024-LN-8892",
          label: "CargoLink Shipping Label",
          warehouse: "Premium Cargo Warehouse\n123 Heathrow Logistics Park\nLondon, UK",
          qr: true
        }
      }
    },
    {
      id: 5,
      title: "Track & Save Money",
      description: "Monitor your cargo's journey and watch your final price drop as more shippers join the aggregation",
      icon: TrendingDown,
      details: [
        "Real-time cargo tracking from pickup to delivery",
        "Watch prices decrease as aggregation grows",
        "Get notifications on status updates",
        "Collect cargo with final discounted invoice"
      ],
      demo: {
        type: "tracking",
        content: {
          status: "In Transit to Local Warehouse",
          progress: 75,
          timeline: [
            { step: "Dropped at Foreign Warehouse", completed: true, time: "3 days ago" },
            { step: "Cargo Aggregated & Shipped", completed: true, time: "1 day ago" },
            { step: "In Transit", completed: true, time: "Current", active: true },
            { step: "Ready for Collection", completed: false, time: "Est. 2 days" }
          ],
          pricing: {
            original: "$90/CBM",
            current: "$45/CBM",
            final: "$42/CBM"
          }
        }
      }
    }
  ];

  const agentSteps: {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
    details: string[];
    demo: Demo;
  }[] = [
    {
      id: 1,
      title: "Register Your Company",
      description: "Submit your shipping company details for admin verification and approval",
      icon: Shield,
      details: [
        "Enter company registration details",
        "Upload business documents",
        "Provide contact person information",
        "Wait for admin approval (24-48 hours)"
      ],
      demo: {
        type: "form",
        content: {
          title: "Agent Registration",
          fields: ["Company Name", "Registration Number", "Contact Person", "Business License"],
          cta: "Submit for Approval"
        }
      }
    },
    {
      id: 2,
      title: "Set Up Shipping Routes",
      description: "Define your service areas and competitive pricing for air and sea freight options",
      icon: Globe,
      details: [
        "Create shipping routes you service",
        "Set competitive Sea freight rates per CBM",
        "Define Air freight pricing per KG",
        "Set minimum cargo requirements"
      ],
      demo: {
        type: "routes",
        content: {
          routes: [
            { from: "London", to: "Lagos", sea: "$65/CBM", air: "$15/KG" },
            { from: "London", to: "Dubai", sea: "$45/CBM", air: "$12/KG" },
            { from: "London", to: "Mumbai", sea: "$75/CBM", air: "$18/KG" }
          ]
        }
      }
    },
    {
      id: 3,
      title: "Receive Aggregated Orders",
      description: "Get notifications when cargo aggregations match your routes and capacity",
      icon: Package,
      details: [
        "Automatic matching with shipper demands",
        "Receive consolidated order notifications",
        "View total cargo volumes and destinations",
        "Accept or decline aggregation opportunities"
      ],
      demo: {
        type: "orders",
        content: {
          pending: {
            route: "London → Lagos",
            volume: "25.6 CBM",
            shippers: 15,
            value: "$1,665",
            deadline: "2 days"
          }
        }
      }
    },
    {
      id: 4,
      title: "Confirm & Process Cargo",
      description: "Verify received cargo using aggregation codes and update system for automatic billing",
      icon: Clock,
      details: [
        "Scan or enter aggregation codes",
        "Confirm cargo receipt at warehouse",
        "System automatically calculates final pricing",
        "Process shipment to destination"
      ],
      demo: {
        type: "confirmation",
        content: {
          codes: ["AGG-2024-LN-8892", "AGG-2024-LN-8893", "AGG-2024-LN-8894"],
          status: "15/15 cargo items confirmed",
          ready: "Ready for shipment"
        }
      }
    }
  ];

  const currentSteps = userType === 'shipper' ? shipperSteps : agentSteps;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % currentSteps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSteps.length]);

// Demo types
interface DemoFormContent {
    title: string;
    fields: string[];
    cta: string;
}

interface DemoSelectorMode {
    type: string;
    price: string;
    time: string;
    active: boolean;
}
interface DemoSelectorContent {
    from: string;
    to: string;
    modes: DemoSelectorMode[];
}

interface DemoAgentsRecommended {
    name: string;
    badge: string;
    price: string;
    savings: string;
    aggregation: string;
}
interface DemoAgentsAlternative {
    name: string;
    price: string;
    status: string;
}
interface DemoAgentsContent {
    recommended: DemoAgentsRecommended;
    alternatives: DemoAgentsAlternative[];
}

interface DemoCodeContent {
    code: string;
    label: string;
    warehouse: string;
    qr: boolean;
}

interface DemoTrackingTimelineItem {
    step: string;
    completed: boolean;
    time: string;
    active?: boolean;
}
interface DemoTrackingPricing {
    original: string;
    current: string;
    final: string;
}
interface DemoTrackingContent {
    status: string;
    progress: number;
    timeline: DemoTrackingTimelineItem[];
    pricing: DemoTrackingPricing;
}

interface DemoRoutesRoute {
    from: string;
    to: string;
    sea: string;
    air: string;
}
interface DemoRoutesContent {
    routes: DemoRoutesRoute[];
}

interface DemoOrdersPending {
    route: string;
    volume: string;
    shippers: number;
    value: string;
    deadline: string;
}
interface DemoOrdersContent {
    pending: DemoOrdersPending;
}

interface DemoConfirmationContent {
    codes: string[];
    status: string;
    ready: string;
}

type Demo =
    | { type: 'form'; content: DemoFormContent }
    | { type: 'selector'; content: DemoSelectorContent }
    | { type: 'agents'; content: DemoAgentsContent }
    | { type: 'code'; content: DemoCodeContent }
    | { type: 'tracking'; content: DemoTrackingContent }
    | { type: 'routes'; content: DemoRoutesContent }
    | { type: 'orders'; content: DemoOrdersContent }
    | { type: 'confirmation'; content: DemoConfirmationContent };

const renderDemo = (demo: Demo) => {
    switch (demo.type) {
        case 'form':
            return (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h4 className="text-lg font-semibold mb-4">{demo.content.title}</h4>
                    <div className="space-y-3">
                        {demo.content.fields.map((field, idx) => (
                            <div key={idx} className="relative">
                                <input 
                                    type="text" 
                                    placeholder={field}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled
                                />
                            </div>
                        ))}
                        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold">
                            {demo.content.cta}
                        </button>
                    </div>
                </div>
            );

        case 'selector':
            return (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-600">From: <span className="font-semibold text-gray-900">{demo.content.from}</span></div>
                        <div className="text-sm text-gray-600">To: <span className="font-semibold text-gray-900">{demo.content.to}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {demo.content.modes.map((mode, idx) => (
                            <div key={idx} className={`p-4 rounded-lg border-2 transition-all ${
                                mode.active ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}>
                                <div className="flex items-center space-x-2 mb-2">
                                    {mode.type === 'Air' ? <Plane className="w-5 h-5 text-blue-600" /> : <Ship className="w-5 h-5 text-blue-600" />}
                                    <span className="font-semibold">{mode.type} Freight</span>
                                </div>
                                <div className="text-lg font-bold text-blue-600">{mode.price}</div>
                                <div className="text-sm text-gray-600">{mode.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'agents':
            return (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <span className="font-semibold">{demo.content.recommended.name}</span>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {demo.content.recommended.badge}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-2xl font-bold text-green-600">{demo.content.recommended.price}</div>
                                <div className="text-sm text-gray-600">{demo.content.recommended.aggregation}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-green-600">{demo.content.recommended.savings}</div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {demo.content.alternatives.map((agent, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                                <span className="font-medium">{agent.name}</span>
                                <div className="text-right">
                                    <div className="font-bold">{agent.price}</div>
                                    <div className="text-xs text-gray-500">{agent.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'code':
            return (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-lg">Your Aggregation Code</h4>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-2">{demo.content.code}</div>
                        <div className="w-20 h-20 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <div className="text-xs">QR Code</div>
                        </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm font-semibold mb-2">Warehouse Address:</div>
                        <div className="text-sm text-gray-700 whitespace-pre-line">{demo.content.warehouse}</div>
                    </div>
                </div>
            );

        case 'tracking':
            return (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">{demo.content.status}</span>
                            <span className="text-sm text-blue-600">{demo.content.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${demo.content.progress}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="space-y-3 mb-4">
                        {demo.content.timeline.map((item, idx) => (
                            <div key={idx} className={`flex items-center space-x-3 ${item.active ? 'text-blue-600' : item.completed ? 'text-gray-700' : 'text-gray-400'}`}>
                                <div className={`w-3 h-3 rounded-full ${item.active ? 'bg-blue-600 animate-pulse' : item.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <div className="flex-1 text-sm">{item.step}</div>
                                <div className="text-xs">{item.time}</div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Original Price:</span>
                            <span className="text-sm line-through text-gray-500">{demo.content.pricing.original}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Current Price:</span>
                            <span className="text-sm text-blue-600">{demo.content.pricing.current}</span>
                        </div>
                        <div className="flex justify-between items-center font-bold">
                            <span>Final Price:</span>
                            <span className="text-green-600">{demo.content.pricing.final}</span>
                        </div>
                    </div>
                </div>
            );

        case 'routes':
            return (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h4 className="text-lg font-semibold mb-4">Your Shipping Routes</h4>
                    <div className="space-y-3">
                        {demo.content.routes.map((route, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div className="font-medium">{route.from} → {route.to}</div>
                                <div className="flex space-x-4 text-sm">
                                    <div>Sea: <span className="font-bold text-blue-600">{route.sea}</span></div>
                                    <div>Air: <span className="font-bold text-purple-600">{route.air}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'orders':
            return (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold">New Aggregation Order</h4>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                Deadline: {demo.content.pending.deadline}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="text-sm text-gray-600">Route</div>
                                <div className="font-semibold">{demo.content.pending.route}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Total Volume</div>
                                <div className="font-semibold">{demo.content.pending.volume}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Shippers</div>
                                <div className="font-semibold">{demo.content.pending.shippers} customers</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Total Value</div>
                                <div className="font-semibold text-green-600">{demo.content.pending.value}</div>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold">Accept Order</button>
                            <button className="px-6 border border-gray-300 rounded-lg">Decline</button>
                        </div>
                    </div>
                </div>
            );

        case 'confirmation':
            return (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h4 className="text-lg font-semibold mb-4">Cargo Confirmation</h4>
                    <div className="space-y-2 mb-4">
                        {demo.content.codes.map((code, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="font-mono text-sm">{code}</div>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-lg font-semibold text-blue-900 mb-1">{demo.content.status}</div>
                        <div className="text-sm text-blue-700">{demo.content.ready}</div>
                    </div>
                </div>
            );

        default:
            return null;
    }
};

  return (
    <div id="how-it-works" className="relative py-20 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Clock className="w-4 h-4" />
            <span>Simple Process</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CargoLink
            </span>{' '}
            Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get started in minutes with our streamlined process designed for both shippers and agents. 
            Choose your journey below to see exactly how it works.
          </p>

          {/* User Type Toggle */}
          <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <button
              onClick={() => setUserType('shipper')}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                userType === 'shipper'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              For Shippers
            </button>
            <button
              onClick={() => setUserType('agent')}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                userType === 'agent'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              For Agents
            </button>
          </div>
        </div>

        {/* Process Steps */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Steps List */}
          <div className="space-y-6">
            {currentSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              
              return (
                <div
                  key={step.id}
                  className={`group cursor-pointer transition-all duration-500 ${
                    isActive ? 'transform scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-white border-blue-200 shadow-xl' 
                      : 'bg-white/60 backdrop-blur-sm border-gray-100 hover:border-gray-200 hover:shadow-lg hover:bg-white/80'
                  }`}>
                    {/* Step Number */}
                    <div className={`absolute -left-4 -top-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                    }`}>
                      {step.id}
                    </div>

                    <div className="flex items-start space-x-4 pl-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <Icon className={`w-6 h-6 transition-colors duration-300 ${
                          isActive ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {step.description}
                        </p>
                        
                        {isActive && (
                          <div className="space-y-2 animate-fadeIn">
                            {step.details.map((detail, idx) => (
                              <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                <span>{detail}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <ChevronRight className={`w-5 h-5 transition-all duration-300 ${
                        isActive ? 'text-blue-600 rotate-90' : 'text-gray-400 group-hover:text-gray-600'
                      }`} />
                    </div>

                    {/* Connection Line */}
                    {index < currentSteps.length - 1 && (
                      <div className={`absolute -bottom-6 left-6 w-0.5 h-12 transition-colors duration-300 ${
                        isActive ? 'bg-blue-300' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Demo */}
          <div className="sticky top-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                  userType === 'shipper' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  <span>Step {activeStep + 1} Demo</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentSteps[activeStep].title}
                </h3>
                <p className="text-gray-600">
                  {currentSteps[activeStep].description}
                </p>
              </div>

              {/* Demo Content */}
              <div className="min-h-[400px] flex items-center justify-center">
                {renderDemo(currentSteps[activeStep].demo)}
              </div>

              {/* Step Indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {currentSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeStep === index 
                        ? (userType === 'shipper' ? 'bg-blue-600' : 'bg-purple-600')
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of {userType === 'shipper' ? 'businesses saving money' : 'agents growing their revenue'} with CargoLink today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold">
                {userType === 'shipper' ? 'Start Shipping Now' : 'Register as Agent'}
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-gray-400 hover:shadow-lg transition-all duration-200 font-semibold">
                Contact Sales Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default HowItWorks;