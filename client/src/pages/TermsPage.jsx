import React from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/common/Breadcrumb';

export default function TermsPage() {
  return (
    <>
      <Helmet><title>Terms of Service | PrintJack</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Terms of Service' }]} />
        <h1 className="text-3xl font-bold text-[#1D3557] mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: January 1, 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">1. Acceptance of Terms</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              By accessing and using PrintJack (printjack.in), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">2. Account Registration</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">3. Products & Orders</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              All products are custom-printed upon order. Product images on the website are for illustrative purposes. Colors may vary slightly due to screen differences. PrintJack reserves the right to limit order quantities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">4. Pricing & Payment</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              All prices are in Indian Rupees (INR) and include applicable GST unless stated otherwise. We reserve the right to change prices without prior notice. Payments are processed securely through Razorpay.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">5. Intellectual Property</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              You retain ownership of designs you create. By uploading content, you grant PrintJack a non-exclusive license to reproduce the content for order fulfillment. You must have the right to use all uploaded content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">6. Prohibited Content</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              We do not accept designs that infringe on intellectual property rights, contain hate speech, explicit content, or promote violence. PrintJack reserves the right to reject any order.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">7. Limitation of Liability</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              PrintJack shall not be liable for any indirect, incidental, or consequential damages. Our total liability shall not exceed the amount paid for the specific order in question.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1D3557]">8. Governing Law</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              These terms are governed by Indian law. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
