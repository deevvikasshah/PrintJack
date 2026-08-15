import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Phone, Mail, Zap, Truck, RefreshCw, CheckCircle2, Headphones } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const WHATSAPP_NUMBER = '917738172709';
const SUPPORT_EMAIL = 'sparshkothari9@gmail.com';
const SUPPORT_PHONE = '+917738172709';

const QUICK_REPLIES = [
  {
    label: 'Track my order',
    icon: Truck,
    answer: 'You can track your order anytime from your dashboard. Go to My Orders → select the order to see the live status timeline. Need more help? Chat with us on WhatsApp.',
  },
  {
    label: 'Order status',
    icon: RefreshCw,
    answer: 'Orders are typically confirmed within 24 hours, go into production the next day, and ship within 3-5 business days. You will receive email and WhatsApp updates at every step.',
  },
  {
    label: 'Design help',
    icon: Zap,
    answer: 'You can upload your own design or create one in our editor. Prefer personal help? Send us your design on WhatsApp and we will set it up for you.',
  },
  {
    label: 'Delivery time',
    icon: Truck,
    answer: 'Standard shipping takes 5-7 business days and express shipping takes 2-3 business days after production. Production usually takes 2-4 business days.',
  },
  {
    label: 'Talk to a human',
    icon: Headphones,
    answer: 'We are here to help! Tap WhatsApp to chat live, call us, or leave a message below and we will reply within 24 hours.',
  },
];

export default function LiveChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeReply, setActiveReply] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [unread, setUnread] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const scrollRef = useRef(null);

  useEffect(() => {
    if (user && (user.name || user.email || user.phone)) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name || '',
        email: f.email || user.email || '',
        phone: f.phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => setUnread(false), 4000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeReply, showForm, sent]);

  const handleQuickReply = (reply) => {
    setActiveReply(reply);
    setShowForm(false);
    setSent(false);
  };

  const handleWhatsApp = (text) => {
    const encoded = encodeURIComponent(text || 'Hi PrintJack! I need help with my order.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    setSending(true);
    try {
      await api.post('/support/contact', {
        ...form,
        subject: 'Live Chat Widget Message',
        topic: 'live-chat',
      });
      setSent(true);
      setShowForm(false);
      setActiveReply(null);
      setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', message: '' });
    } catch {
      // fallback: open WhatsApp with composed message
      const text = `Hi PrintJack! My name is ${form.name}. ${form.message}`;
      handleWhatsApp(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-3 bg-white rounded-2xl shadow-2xl border border-gray-100 w-[320px] sm:w-[360px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1D3557] to-[#2b4a75] p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center">
                  <Headphones size={20} className="text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1D3557]" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">PrintJack Support</p>
                <p className="text-emerald-300 text-xs">Online · Replies in minutes</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-white/70 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="bg-gray-50 p-4 space-y-3 max-h-80 overflow-y-auto flex-1">
            <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm max-w-[90%]">
              <p className="text-sm text-gray-700">
                {user?.name
                  ? `Hi ${user.name.trim().split(' ')[0]}! 👋 How can we help you today? Pick a topic below or ask us anything.`
                  : 'Hi there! 👋 How can we help you today? Pick a topic below or ask us anything.'}
              </p>
            </div>

            {activeReply && (
              <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm max-w-[90%]">
                <p className="text-sm text-gray-700">{activeReply.answer}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleWhatsApp()}
                    className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#20bd5a] transition-colors"
                  >
                    <MessageCircle size={13} fill="white" /> Continue on WhatsApp
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-1.5 bg-[#1D3557] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#16283f] transition-colors"
                  >
                    <Mail size={13} /> Leave a message
                  </button>
                </div>
              </div>
            )}

            {showForm && !sent && (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl p-3 shadow-sm space-y-2.5">
                <p className="text-xs font-semibold text-[#1D3557]">Send us a message</p>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E63946]"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email (optional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E63946]"
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Phone (optional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E63946]"
                />
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="How can we help?"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E63946] resize-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-[#E63946] hover:bg-[#c62d38] text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {sending ? (
                    <><RefreshCw size={15} className="animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={15} /> Send Message</>
                  )}
                </button>
              </form>
            )}

            {sent && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <CheckCircle2 size={28} className="text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-green-700">Message sent!</p>
                <p className="text-xs text-green-600 mt-1">We will get back to you within 24 hours.</p>
              </div>
            )}

            {!showForm && (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold px-1">Quick Help</p>
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply.label}
                    onClick={() => handleQuickReply(reply)}
                    className="w-full flex items-center gap-2.5 bg-white hover:bg-red-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors text-left"
                  >
                    <reply.icon size={16} className="text-[#E63946] flex-shrink-0" />
                    {reply.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-3 bg-white">
            <div className="flex gap-2">
              <button
                onClick={() => handleWhatsApp()}
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle size={15} fill="white" /> WhatsApp
              </button>
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone size={15} /> Call
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail size={15} /> Email
              </a>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2">Mon-Sat, 10AM-8PM · We reply within 24 hours</p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => {
          setIsOpen((o) => !o);
          if (!isOpen) setUnread(false);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative group"
        aria-label="Live chat support"
      >
        <span className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20" />
        <span className={`absolute -top-10 right-0 bg-[#1D3557] text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-opacity ${hovered || unread ? 'opacity-100' : 'opacity-0'}`}>
          {unread && !hovered ? 'Chat with us!' : 'Chat with us!'}
        </span>
        {unread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E63946] rounded-full border-2 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
          </span>
        )}
        <div className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer">
          {isOpen ? (
            <X size={26} className="text-white" />
          ) : (
            <MessageCircle size={26} className="text-white" fill="white" />
          )}
        </div>
      </button>
    </div>
  );
}
