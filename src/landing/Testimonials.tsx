import  { useState, useEffect } from 'react';
import { Star, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  interface Testimonial {
    name: string;
    role: string;
    company?: string;
    quote: string;
    rating: number;
    avatar?: string; // Optional avatar image URL or placeholder
  }

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "E-commerce Owner",
      company: "Trendy Boutique",
      quote: "CargoLink transformed our shipping process! We saved 45% on our last shipment to Europe, and the tracking system kept us informed every step of the way. Highly recommend!",
      rating: 5,
      avatar: "https://via.placeholder.com/64",
    },
    {
      name: "Michael Adebayo",
      role: "Logistics Manager",
      company: "Global Imports Ltd",
      quote: "The aggregation system is a game-changer. We consolidated our cargo with other shippers and cut costs significantly. The platform is intuitive and reliable.",
      rating: 4,
      avatar: "https://via.placeholder.com/64",
    },
    {
      name: "Emily Chen",
      role: "Freight Agent",
      company: "Swift Cargo Solutions",
      quote: "As an agent, CargoLink's platform makes it easy to manage routes and connect with shippers. The real-time order notifications have boosted our efficiency.",
      rating: 5,
      avatar: "https://via.placeholder.com/64",
    },
    {
      name: "David Patel",
      role: "Small Business Owner",
      quote: "I was skeptical at first, but CargoLink delivered. The Gold Agent network gave us access to top-tier shipping options at unbeatable prices.",
      rating: 4,
      avatar: "https://via.placeholder.com/64",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Rotate every 5 seconds to match HowItWorks
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="testimonials" className="relative py-20 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            <span>Trusted by Our Customers</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            What Our{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Customers Say
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from businesses and agents who’ve saved time and money with CargoLink’s smart shipping solutions.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Testimonial Cards */}
          <div className="space-y-6">
            {testimonials.map((testimonial, index) => {
              const isActive = activeTestimonial === index;
              return (
                <div
                  key={index}
                  className={`group cursor-pointer transition-all duration-500 ${
                    isActive ? 'transform scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                >
                  <div
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                      isActive
                        ? 'bg-white border-blue-200 shadow-xl'
                        : 'bg-white/60 backdrop-blur-sm border-gray-100 hover:border-gray-200 hover:shadow-lg hover:bg-white/80'
                    }`}
                  >
                    {/* Testimonial Number */}
                    <div
                      className={`absolute -left-4 -top-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="flex items-start space-x-4 pl-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={testimonial.avatar}
                          alt={`${testimonial.name}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                              {testimonial.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {testimonial.role}
                              {testimonial.company && `, ${testimonial.company}`}
                            </p>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">“{testimonial.quote}”</p>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 transition-all duration-300 ${
                          isActive ? 'text-blue-600 rotate-90' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Testimonial Preview */}
          <div className="sticky top-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Star className="w-4 h-4" />
                  <span>Testimonial Preview</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{testimonials[activeTestimonial].name}</h3>
                <p className="text-gray-600">
                  {testimonials[activeTestimonial].role}
                  {testimonials[activeTestimonial].company && `, ${testimonials[activeTestimonial].company}`}
                </p>
              </div>

              {/* Testimonial Content */}
              <div className="min-h-[200px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={`${testimonials[activeTestimonial].name}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-lg text-gray-700 italic text-center mb-4">
                  “{testimonials[activeTestimonial].quote}”
                </p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonials[activeTestimonial].rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeTestimonial === index ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
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
              Join Our Satisfied Customers
            </h3>
            <p className="text-gray-600 mb-6">
              Experience the savings and efficiency that our customers love. Start shipping with CargoLink today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold">
                Start Shipping Now
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-gray-400 hover:shadow-lg transition-all duration-200 font-semibold">
                Read More Stories
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
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

export default Testimonials;