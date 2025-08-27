import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'ordering', name: 'Ordering' },
    { id: 'delivery', name: 'Delivery' },
    { id: 'payment', name: 'Payment' },
    { id: 'account', name: 'Account' },
    { id: 'technical', name: 'Technical' },
  ];

  const faqs = [
    {
      id: 1,
      category: 'ordering',
      question: 'How do I place an order?',
      answer: 'To place an order, browse our items, add them to your cart, and proceed to checkout. You can pay using various methods including credit cards, debit cards, and digital wallets.'
    },
    {
      id: 2,
      category: 'delivery',
      question: 'How does robot delivery work?',
      answer: 'Our autonomous robots pick up your order from the vendor and navigate safely to your location. You\'ll receive real-time tracking updates and an OTP for secure pickup when the robot arrives.'
    },
    {
      id: 3,
      category: 'delivery',
      question: 'What is the delivery time?',
      answer: 'Typical delivery times range from 15-45 minutes depending on your location, order complexity, and current demand. You\'ll see an estimated delivery time before confirming your order.'
    },
    {
      id: 4,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards, digital wallets like PayPal, and cash on delivery in select areas. All payments are processed securely.'
    },
    {
      id: 5,
      category: 'delivery',
      question: 'What if the robot can\'t find my location?',
      answer: 'Our robots use advanced GPS and mapping technology. If there\'s an issue, you\'ll be contacted immediately. You can also provide additional location details during checkout.'
    },
    {
      id: 6,
      category: 'account',
      question: 'How do I track my order?',
      answer: 'You can track your order in real-time from your dashboard or orders page. You\'ll also receive SMS and email notifications with tracking updates.'
    },
    {
      id: 7,
      category: 'ordering',
      question: 'Can I modify or cancel my order?',
      answer: 'You can modify or cancel your order within 5 minutes of placing it, or before the vendor starts preparing it. Check your order status in the dashboard.'
    },
    {
      id: 8,
      category: 'technical',
      question: 'The app is not working properly. What should I do?',
      answer: 'Try refreshing the page or clearing your browser cache. If the issue persists, contact our support team with details about the problem you\'re experiencing.'
    },
    {
      id: 9,
      category: 'delivery',
      question: 'What happens if my order is damaged?',
      answer: 'If your order arrives damaged, please report it immediately through the app or contact support. We\'ll provide a full refund or replacement at no extra cost.'
    },
    {
      id: 10,
      category: 'account',
      question: 'How do I become a vendor?',
      answer: 'To become a vendor, register with a vendor account and complete the setup process. You\'ll need to provide business information and go through our verification process.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Help Center
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto mb-8">
              Find answers to common questions and get the help you need
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 text-gray-900 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/how-it-works" className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-primary-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How It Works</h3>
            <p className="text-gray-600">Learn about our delivery process</p>
          </Link>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-primary-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m2-4h4a2 2 0 012 2v6a2 2 0 01-2 2h-4m0 0V8a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2h4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600">Chat with our support team</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-primary-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600">Send us an email</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-primary-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-600">Call us directly</p>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No questions found matching your search.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredFaqs.map(faq => (
                  <div key={faq.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-primary-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still Need Help?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you with any questions or issues.
          </p>
          <div className="space-x-4">
            <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
              Contact Support
            </button>
            <Link
              to="/how-it-works"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg border border-primary-600 hover:bg-primary-50 transition-colors inline-block"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
