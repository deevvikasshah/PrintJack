import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';
import toast from 'react-hot-toast';

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

  const quickLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Blog', to: '/blog' },
    { label: 'Bulk Orders', to: '/bulk-orders' },
    { label: 'Contact', to: '/contact' },
  ];

  const supportLinks = [
    { label: 'Contact', to: '/contact' },
    { label: 'Track Order', to: '/track-order' },
    { label: 'FAQs', to: '/faq' },
    { label: 'Shipping Info', to: '/faq#shipping' },
    { label: 'Returns & Refunds', to: '/faq#returns' },
  ];

  const legalLinks = [
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Refund Policy', to: '/faq#refunds' },
    { label: 'Cookie Policy', to: '/privacy#cookies' },
  ];

  return (
    <footer className="bg-brown-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl text-paper-50">Stay in the loop</h3>
              <p className="text-paper-100/60 text-sm mt-1">Get exclusive offers, design tips, and new product updates.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-3 bg-white/10 border border-white/20 rounded-l-full text-sm placeholder-paper-100/40 focus:outline-none focus:border-pj-green transition-colors"
                required
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-6 py-3 bg-pj-green text-white rounded-r-full font-medium text-sm hover:bg-paper-200 hover:text-ink transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={16} />
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="font-display text-2xl text-paper-50">
                PrintJack
              </span>
            </Link>
            <p className="text-paper-100/60 text-sm leading-relaxed mb-5">
              India's premium custom printing platform. Turn your ideas into reality with high-quality prints.
            </p>
            <div className="space-y-2.5 text-sm text-paper-100/60">
              <p className="flex items-center gap-2.5"><MapPin size={15} className="flex-shrink-0 text-paper-100/40" /> Mumbai, Maharashtra, India</p>
              <p className="flex items-center gap-2.5"><Phone size={15} className="flex-shrink-0 text-paper-100/40" /> +91 98765 43210</p>
              <p className="flex items-center gap-2.5"><Mail size={15} className="flex-shrink-0 text-paper-100/40" /> hello@printjack.in</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-5 text-paper-50">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-paper-100/60 hover:text-pj-green transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-5 text-paper-50">Customer Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-paper-100/60 hover:text-pj-green transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-5 text-paper-50">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-paper-100/60 hover:text-pj-green transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Social + Payment + Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-paper-100/70 hover:bg-pj-green hover:text-white transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-paper-100/60">
              <span className="text-paper-100/40 mr-1">We accept</span>
              <div className="px-2.5 py-1.5 bg-white/10 rounded text-[10px] font-semibold tracking-wide">UPI</div>
              <div className="px-2.5 py-1.5 bg-white/10 rounded text-[10px] font-semibold tracking-wide">VISA</div>
              <div className="px-2.5 py-1.5 bg-white/10 rounded text-[10px] font-semibold tracking-wide">MASTERCARD</div>
              <div className="px-2.5 py-1.5 bg-white/10 rounded text-[10px] font-semibold tracking-wide">NETBANKING</div>
              <div className="px-2.5 py-1.5 bg-white/10 rounded text-[10px] font-semibold tracking-wide">RAZORPAY</div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-paper-100/50">© 2026 PrintJack. All rights reserved.</p>
            <p className="mt-1.5 text-xs text-paper-100/35">
              GSTIN: 27AABCP1234M1Z5 | CIN: U72200MH2020PTC123456
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
