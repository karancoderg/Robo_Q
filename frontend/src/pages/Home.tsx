import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  TruckIcon,
  ClockIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const { isAuthenticated, isUser, isVendor } = useAuth();

  const features = [
    {
      name: 'Autonomous Delivery',
      description: 'Our robots navigate safely to deliver your orders without human intervention.',
      icon: TruckIcon,
    },
    {
      name: 'Fast & Reliable',
      description: 'Get your food and groceries delivered in 30 minutes or less.',
      icon: ClockIcon,
    },
    {
      name: 'Contactless & Safe',
      description: 'Completely contactless delivery with OTP verification for security.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Real-time Tracking',
      description: 'Track your robot delivery in real-time with live location updates.',
      icon: DevicePhoneMobileIcon,
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <main className="mt-6 sm:mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight font-extrabold text-gray-900">
                  <span className="block">Autonomous delivery</span>
                  <span className="block text-primary-600 mt-1">by robots</span>
                </h1>
                <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-500 max-w-md sm:max-w-xl mx-auto lg:mx-0">
                  Get your favorite food and groceries delivered by our fleet of autonomous robots. 
                  Fast, reliable, and contactless delivery right to your doorstep.
                </p>
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center lg:justify-start">
                  <div className="w-full sm:w-auto">
                    {isAuthenticated && isUser ? (
                      <Link
                        to="/items"
                        className="w-full flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg transition-colors shadow-lg hover:shadow-xl"
                      >
                        Start Ordering
                      </Link>
                    ) : (
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg transition-colors shadow-lg hover:shadow-xl"
                      >
                        Get Started
                      </Link>
                    )}
                  </div>
                  <div className="w-full sm:w-auto">
                    <Link
                      to="/items"
                      className="w-full flex items-center justify-center px-6 sm:px-8 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 md:py-4 md:text-lg transition-colors"
                    >
                      Browse Items
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-48 sm:h-56 md:h-72 lg:h-full w-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center">
            <div className="text-white text-6xl sm:text-7xl md:text-8xl animate-bounce-slow">🤖</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="section-padding bg-white">
        <div className="container-responsive">
          <div className="text-center lg:text-center">
            <h2 className="text-sm sm:text-base text-primary-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl lg:text-4xl leading-8 font-extrabold tracking-tight text-gray-900">
              Why choose robot delivery?
            </p>
            <p className="mt-4 max-w-2xl text-lg sm:text-xl text-gray-500 mx-auto">
              Experience the future of delivery with our autonomous robot fleet.
            </p>
          </div>

          <div className="mt-8 sm:mt-12">
            <dl className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:gap-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative bg-white p-4 sm:p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                  <dt>
                    <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-primary-500 text-white mb-4">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                    </div>
                    <p className="text-lg sm:text-xl leading-6 font-medium text-gray-900">
                      {feature.name}
                    </p>
                  </dt>
                  <dd className="mt-2 text-sm sm:text-base text-gray-500 leading-relaxed">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50">
        <div className="container-responsive section-padding-sm lg:flex lg:items-center lg:justify-between">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 text-center lg:text-left">
            {!isAuthenticated ? (
              <>
                <span className="block">Ready to get started?</span>
                <span className="block text-primary-600 mt-1">Join thousands of satisfied customers.</span>
              </>
            ) : (
              <>
                <span className="block">Welcome back!</span>
                <span className="block text-primary-600 mt-1">Ready to place your next order?</span>
              </>
            )}
          </h2>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 lg:mt-0 lg:flex-shrink-0 justify-center lg:justify-start">
            {!isAuthenticated ? (
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Sign Up Now
              </Link>
            ) : (
              <Link
                to={isVendor ? "/vendor/dashboard" : "/dashboard"}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
              </Link>
            )}
            <Link
              to="/items"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
