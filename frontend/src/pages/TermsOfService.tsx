import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Please read these terms carefully before using our autonomous delivery service.
            </p>
            <p className="text-primary-200 mt-4">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose prose-lg max-w-none">
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using NexDrop's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-600 mb-4">
                These Terms of Service ("Terms") govern your use of our next-generation autonomous delivery platform, including our website, mobile application, and delivery services (collectively, the "Service").
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 mb-4">
                NexDrop provides a next-generation autonomous delivery platform that connects customers with local vendors for food and grocery delivery using advanced robotic delivery systems. Our service includes:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Online ordering platform for food and groceries</li>
                <li>Autonomous robot delivery service</li>
                <li>Real-time order tracking</li>
                <li>Customer support services</li>
                <li>Vendor partnership program</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Registration</h3>
              <p className="text-gray-600 mb-4">
                To use our Service, you must create an account and provide accurate, complete information. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your account information remains current and accurate</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Eligibility</h3>
              <p className="text-gray-600 mb-4">
                You must be at least 18 years old to use our Service. By using our Service, you represent and warrant that you meet this age requirement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Orders and Payments</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Placing Orders</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>All orders are subject to availability and vendor acceptance</li>
                <li>Prices are set by individual vendors and may change without notice</li>
                <li>You agree to pay all charges associated with your order</li>
                <li>Orders may be cancelled within 5 minutes of placement or before vendor preparation begins</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Payment Terms</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Payment is due at the time of order placement</li>
                <li>We accept major credit cards, debit cards, and digital wallets</li>
                <li>Delivery fees and taxes will be clearly displayed before payment</li>
                <li>Refunds will be processed according to our refund policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Delivery Service</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Delivery Process</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Deliveries are made by autonomous robots within our service area</li>
                <li>Estimated delivery times are approximate and may vary</li>
                <li>You must be available to receive your order at the specified location</li>
                <li>An OTP will be required to retrieve your order from the robot</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Delivery Limitations</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Service is limited to designated delivery zones</li>
                <li>Weather conditions may affect delivery availability</li>
                <li>Some locations may be inaccessible to our robots</li>
                <li>We reserve the right to suspend service for safety reasons</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Conduct</h2>
              <p className="text-gray-600 mb-4">
                You agree not to use our Service to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with or disrupt our robots or delivery operations</li>
                <li>Provide false or misleading information</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the Service for any commercial purpose without authorization</li>
                <li>Harass, abuse, or harm other users or vendors</li>
                <li>Upload or transmit malicious code or content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Vendor Relationships</h2>
              <p className="text-gray-600 mb-4">
                DeliveryBot acts as a platform connecting customers with independent vendors. We are not responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Food quality, safety, or preparation</li>
                <li>Vendor compliance with health and safety regulations</li>
                <li>Disputes between customers and vendors</li>
                <li>Vendor availability or business hours</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                The Service and its original content, features, and functionality are owned by DeliveryBot and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-gray-600 mb-4">
                You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of our content without prior written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Privacy and Data Protection</h2>
              <p className="text-gray-600 mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Availability</h3>
              <p className="text-gray-600 mb-4">
                We strive to provide reliable service but cannot guarantee uninterrupted availability. The Service is provided "as is" without warranties of any kind.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Limitation of Liability</h3>
              <p className="text-gray-600 mb-4">
                To the maximum extent permitted by law, DeliveryBot shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Refund and Cancellation Policy</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Cancellations</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Orders can be cancelled within 5 minutes of placement</li>
                <li>No cancellation is allowed once vendor preparation begins</li>
                <li>Cancelled orders will receive full refunds within 3-5 business days</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Refunds</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Refunds may be issued for damaged, incorrect, or undelivered orders</li>
                <li>Refund requests must be made within 24 hours of delivery</li>
                <li>Refunds are processed to the original payment method</li>
                <li>Delivery fees may be refunded in cases of service failure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
              <p className="text-gray-600 mb-4">
                You may terminate your account at any time by contacting our support team. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Posting updated Terms on our website</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying notices within our application</li>
              </ul>
              <p className="text-gray-600 mb-4">
                Your continued use of the Service after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-600 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved in the courts of San Francisco County, California.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-2"><strong>Email:</strong> legal@nexdrop.com</p>
                <p className="text-gray-600 mb-2"><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p className="text-gray-600 mb-2"><strong>Address:</strong></p>
                <p className="text-gray-600 ml-4">
                  NexDrop Legal Department<br />
                  123 Tech Street<br />
                  Innovation District<br />
                  San Francisco, CA 94105
                </p>
              </div>
            </section>

            <div className="bg-primary-50 p-6 rounded-lg mt-8">
              <p className="text-primary-800 font-medium">
                By using NexDrop's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
