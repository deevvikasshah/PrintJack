import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { PRODUCT_CATEGORIES } from '../../utils/constants';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubscribing(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('Subscribed to our newsletter!');
      setEmail('');
    } catch {
      toast.error('Failed to subscribe');
    } finally {
      setIsSubscribing(false);
    }
  };

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com/printjack', label: 'Facebook' },
    { icon: FaInstagram, href: 'https://instagram.com/printjack', label: 'Instagram' },
    { icon: FaTwitter, href: 'https://twitter.com/printjack', label: 'Twitter' },
    { icon: FaLinkedin, href: 'https://linkedin.com/company/printjack', label: 'LinkedIn' },
    { icon: FaYoutube, href: 'https://youtube.com/printjack', label: 'YouTube' },
  ];

  return (
    <footer className="bg-[#1D3557] text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold">Stay in the loop</h3>
              <p className="text-gray-300 text-sm mt-1">Get exclusive offers, design tips, and new product updates.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-3 bg-white/10 border border-white/20 rounded-l-xl text-sm placeholder-gray-400 focus:outline-none focus:border-[#E63946] transition-colors"
                required
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-6 py-3 bg-[#E63946] text-white rounded-r-xl font-medium text-sm hover:bg-[#c62d38] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={16} />
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#E63946] to-pink-400 bg-clip-text text-transparent">
                PrintJack
              </span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              India's premium custom printing platform. Turn your ideas into reality with high-quality prints.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <p className="flex items-center gap-2"><MapPin size={14} /> Mumbai, Maharashtra, India</p>
              <p className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</p>
              <p className="flex items-center gap-2"><Mail size={14} /> hello@printjack.in</p>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Careers', to: '/careers' },
                { label: 'Blog', to: '/blog' },
                { label: 'Contact', to: '/contact' },
                { label: 'Bulk Orders', to: '/bulk-orders' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-300 hover:text-[#E63946] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Products</h4>
            <ul className="space-y-2.5">
              {PRODUCT_CATEGORIES.slice(0, 7).map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/products?category=${cat.slug}`} className="text-sm text-gray-300 hover:text-[#E63946] transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'FAQ', to: '/faq' },
                { label: 'Track Order', to: '/track-order' },
                { label: 'Shipping Info', to: '/faq#shipping' },
                { label: 'Returns & Refunds', to: '/faq#returns' },
                { label: 'Contact Support', to: '/contact' },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-sm text-gray-300 hover:text-[#E63946] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Refund Policy', to: '/faq#refunds' },
                { label: 'Cookie Policy', to: '/privacy#cookies' },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-sm text-gray-300 hover:text-[#E63946] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
              <p>© 2025 PrintJack. Made with ❤️ in India.</p>
              <p className="text-xs">GSTIN: 27AABCP1234M1Z5 | CIN: U72200MH2020PTC123456</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-300 hover:bg-[#E63946] hover:text-white transition-all"
                    aria-label={social.label}
                  >
                    <social.icon size={14} />
                  </a>
                ))}
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="px-2 py-1 bg-white/10 rounded text-[10px] font-semibold">UPI</div>
                <div className="px-2 py-1 bg-white/10 rounded text-[10px] font-semibold">VISA</div>
                <div className="px-2 py-1 bg-white/10 rounded text-[10px] font-semibold">MC</div>
                <div className="px-2 py-1 bg-white/10 rounded text-[10px] font-semibold">Razorpay</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
