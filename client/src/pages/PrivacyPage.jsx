import React from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/common/Breadcrumb';

export default function PrivacyPage() {
  return (
    <>
      <Helmet><title>Privacy Policy | PrintJack</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Privacy Policy' }]} />
        <h1 className="text-3xl font-bold text-[#1D3557] mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: January 1, 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">1. Information We Collect</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              We collect information you provide directly: name, email, phone number, shipping addresses, payment information, and designs you upload. We also collect device information, IP address, and browsing data through cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">2. How We Use Your Information</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              We use your information to process orders, communicate order updates, improve our services, send promotional offers (with consent), prevent fraud, and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">3. Information Sharing</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              We share information with payment processors (Razorpay), shipping partners, and service providers who assist in order fulfillment. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">4. Data Security</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              We implement industry-standard security measures including SSL encryption, secure payment processing, and regular security audits. However, no method of transmission is 100% secure.
            </p>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-bold text-[#1D3557]">5. Cookies</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              We use cookies for session management, analytics, and to personalize your experience. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">6. Your Rights</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              You have the right to access, correct, or delete your personal data. You can update most information through your dashboard. For data deletion requests, contact privacy@printjack.in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">7. Data Retention</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              We retain your data for as long as your account is active or as needed to provide services. Order data is retained for 7 years for tax and legal compliance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">8. Contact Us</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              For privacy-related queries, contact us at privacy@printjack.in or write to: PrintJack, Mumbai, Maharashtra, India.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
