import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
              <p className="text-gray-600 mb-4">
                We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Name, email address, and phone number</li>
                <li>Delivery address and location information</li>
                <li>Payment information (processed securely by our payment partners)</li>
                <li>Order history and preferences</li>
                <li>Communications with our support team</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Automatically Collected Information</h3>
              <p className="text-gray-600 mb-4">
                When you use our service, we automatically collect certain information:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, features used)</li>
                <li>Location data (when you enable location services)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Process and fulfill your orders</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send order updates and delivery notifications</li>
                <li>Improve our services and develop new features</li>
                <li>Personalize your experience and recommendations</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Providers</h3>
              <p className="text-gray-600 mb-4">
                We share information with trusted third-party service providers who help us operate our platform:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Payment processors for secure transaction handling</li>
                <li>Cloud hosting providers for data storage</li>
                <li>SMS and email service providers for notifications</li>
                <li>Analytics providers to understand usage patterns</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Vendors and Partners</h3>
              <p className="text-gray-600 mb-4">
                We share necessary order information with vendors to fulfill your orders, including your name, delivery address, and order details.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Legal Requirements</h3>
              <p className="text-gray-600 mb-4">
                We may disclose your information if required by law, court order, or government regulation, or to protect our rights and safety.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure payment processing through certified providers</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
              <p className="text-gray-600 mb-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Choices</h2>
              <p className="text-gray-600 mb-4">
                You have several rights regarding your personal information:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Information</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Access and update your account information at any time</li>
                <li>Download a copy of your personal data</li>
                <li>Delete your account and associated data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Communications</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Opt out of marketing emails by clicking unsubscribe</li>
                <li>Manage notification preferences in your account settings</li>
                <li>Contact us to update your communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Location Data</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Enable or disable location services in your device settings</li>
                <li>Choose when to share location information with our app</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-600 mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
                <li><strong>Performance Cookies:</strong> Help us understand how you use our service</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Used to show relevant advertisements</li>
              </ul>
              <p className="text-gray-600 mb-4">
                You can control cookies through your browser settings, but disabling certain cookies may affect functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-600 mb-4">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Account information: Until you delete your account</li>
                <li>Order history: 7 years for tax and legal compliance</li>
                <li>Support communications: 3 years</li>
                <li>Marketing data: Until you opt out or we no longer need it</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-600 mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-600 mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Posting the updated policy on our website</li>
                <li>Sending you an email notification</li>
                <li>Displaying a notice in our app</li>
              </ul>
              <p className="text-gray-600 mb-4">
                Your continued use of our service after any changes indicates your acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-2"><strong>Email:</strong> privacy@nexdrop.com</p>
                <p className="text-gray-600 mb-2"><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p className="text-gray-600 mb-2"><strong>Address:</strong></p>
                <p className="text-gray-600 ml-4">
                  NexDrop Privacy Team<br />
                  123 Tech Street<br />
                  Innovation District<br />
                  San Francisco, CA 94105
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
