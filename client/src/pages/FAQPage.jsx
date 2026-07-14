import React from 'react';
import { Helmet } from 'react-helmet-async';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';

const faqCategories = [
  {
    title: 'General',
    questions: [
      { q: 'What is PrintJack?', a: 'PrintJack is India\'s premium custom printing platform where you can design and order personalized products like t-shirts, mugs, phone cases, stickers, and more.' },
      { q: 'Do I need an account to order?', a: 'Yes, you need to create an account to place orders. This helps you track orders, save designs, and manage your profile.' },
      { q: 'Can I order in bulk?', a: 'Yes! We offer special bulk pricing for orders of 10+ items. Visit our bulk orders page or contact us for custom quotes.' },
    ],
  },
  {
    title: 'Products & Design',
    questions: [
      { q: 'What file formats are supported for uploads?', a: 'We support PNG, JPG, JPEG, WebP, and SVG files. For best results, use high-resolution images (300 DPI recommended).' },
      { q: 'Can I preview my design before ordering?', a: 'Yes! Our design editor provides real-time previews of your design on the product before you add it to cart.' },
      { q: 'What sizes are available?', a: 'Sizes vary by product. T-shirts come in XS to 3XL, mugs in standard 330ml, and phone cases for most popular models.' },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    questions: [
      { q: 'How long does shipping take?', a: 'Standard delivery takes 5-7 business days. Express delivery (available in select cities) takes 2-3 business days.' },
      { q: 'Is there free shipping?', a: 'Yes! We offer free shipping on all orders above ₹999. Orders below ₹999 have a flat shipping fee of ₹99.' },
      { q: 'Do you ship pan-India?', a: 'Yes, we deliver to all serviceable pin codes across India.' },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    questions: [
      { q: 'What is your return policy?', a: 'We offer a 7-day return policy for non-customized items. Customized products can only be returned if there\'s a printing defect.' },
      { q: 'How do I initiate a return?', a: 'Go to My Orders in your dashboard, select the order, and click "Request Return". Our team will review and process it within 48 hours.' },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 5-7 business days after the return is approved. The amount is credited to your original payment method.' },
    ],
  },
  {
    id: 'refunds',
    title: 'Refunds',
    questions: [
      { q: 'How are refunds processed?', a: 'Refunds are made to the original payment method. UPI/Cards: 5-7 days. Wallets: 24-48 hours.' },
      { q: 'Can I get a refund as store credit?', a: 'Yes, you can opt for store credit which is added instantly to your PrintJack wallet with a 10% bonus.' },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = React.useState(null);

  return (
    <>
      <Helmet>
        <title>FAQ | PrintJack - Help Center</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'FAQ' }]} />

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={28} className="text-[#E63946]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1D3557] mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-500">Find answers to common questions about PrintJack</p>
        </div>

        <div className="space-y-8">
          {faqCategories.map((category) => (
            <div key={category.id || category.title} id={category.id}>
              <h2 className="text-xl font-bold text-[#1D3557] mb-4">{category.title}</h2>
              <div className="space-y-2">
                {category.questions.map((faq, i) => {
                  const key = `${category.title}-${i}`;
                  const isOpen = openIndex === key;
                  return (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                      >
                        <span className="font-medium text-sm text-[#1D3557] pr-4">{faq.q}</span>
                        {isOpen ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-gray-50 rounded-2xl p-8">
          <h3 className="text-lg font-bold text-[#1D3557] mb-2">Still have questions?</h3>
          <p className="text-sm text-gray-500 mb-4">Our support team is here to help you.</p>
          <a href="mailto:hello@printjack.in" className="inline-flex items-center gap-2 px-6 py-3 bg-[#E63946] text-white font-medium rounded-xl hover:bg-[#c62d38] transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </>
  );
}
