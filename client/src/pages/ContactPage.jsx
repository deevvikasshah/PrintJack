import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Phone, Mail, MapPin, Clock, MessageCircle,
  Loader2, CheckCircle,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-700 to-navy-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-extrabold text-white">
            Get in Touch
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-white/70 text-lg max-w-xl mx-auto">
            Have a question, need a custom quote, or want to discuss a bulk order? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-5">
                {[
                  { icon: Phone, label: 'Phone', value: '+91 98765 43210', link: 'tel:+919876543210', sub: 'Mon-Sat, 10AM-8PM' },
                  { icon: Mail, label: 'Email', value: 'hello@printjack.in', link: 'mailto:hello@printjack.in', sub: 'We reply within 24 hours' },
                  { icon: MapPin, label: 'Office', value: 'PrintJack Pvt. Ltd.\n123, Industrial Area Phase 2,\nBengaluru, Karnataka - 560100', sub: '' },
                  { icon: Clock, label: 'Business Hours', value: 'Monday - Saturday: 10:00 AM - 8:00 PM\nSunday: Closed', sub: '' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon size={18} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                      {item.link ? (
                        <a href={item.link} className="text-sm font-medium text-gray-900 hover:text-brand-500 transition-colors whitespace-pre-line mt-0.5 block">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-gray-900 whitespace-pre-line mt-0.5">{item.value}</p>
                      )}
                      {item.sub && <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* WhatsApp */}
            <motion.a
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-5 transition-colors shadow-sm"
            >
              <MessageCircle size={24} />
              <div>
                <p className="font-bold">Chat on WhatsApp</p>
                <p className="text-sm text-emerald-100">Quick replies for urgent queries</p>
              </div>
            </motion.a>

            {/* Map placeholder */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
            >
              <div className="bg-gray-200 h-48 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MapPin size={32} className="mx-auto mb-2" />
                  <p className="text-sm font-medium">Map Loading...</p>
                  <p className="text-xs">Bengaluru, Karnataka</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
            >
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Message Sent!</h3>
                  <p className="mt-2 text-gray-500">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                    className="mt-6 text-brand-500 font-semibold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900">Send Us a Message</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={handleChange('name')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="text-xs text-brand-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                        placeholder="you@company.com"
                      />
                      {errors.email && <p className="text-xs text-brand-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                      <select
                        value={form.subject}
                        onChange={handleChange('subject')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="bulk">Bulk Order</option>
                        <option value="custom">Custom Quote</option>
                        <option value="support">Order Support</option>
                        <option value="feedback">Feedback</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Message *</label>
                    <textarea
                      value={form.message}
                      onChange={handleChange('message')}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors resize-none"
                      placeholder="Tell us about your project, requirements, or questions..."
                    />
                    {errors.message && <p className="text-xs text-brand-500 mt-1">{errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-brand-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold px-8 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
