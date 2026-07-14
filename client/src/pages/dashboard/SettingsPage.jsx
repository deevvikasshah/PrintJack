import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageCircle,
  Globe,
  Palette,
  Sun,
  Moon,
  Save,
  Loader2,
  Info,
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
];

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-[#E63946]' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const [notifications, setNotifications] = useState({
    emailOrderUpdates: true,
    emailPromotions: true,
    emailNewsletter: false,
    smsOrderUpdates: true,
    smsPromotions: false,
    whatsappOrderUpdates: true,
    whatsappPromotions: false,
  });

  const [language, setLanguage] = useState(user?.preferences?.language || 'en');
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'INR');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/user/settings');
      if (data.notifications) setNotifications(data.notifications);
      if (data.language) setLanguage(data.language);
      if (data.currency) setCurrency(data.currency);
    } catch {
      // Use defaults
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await api.put('/user/settings/notifications', notifications);
      toast.success('Notification preferences saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await api.put('/user/settings/preferences', { language, currency });
      toast.success('Preferences saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#1D3557] mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-[#1D3557] flex items-center gap-2">
                <Bell size={18} />
                Notification Preferences
              </h2>
              <p className="text-xs text-gray-500 mt-1">Choose how you want to be notified</p>
            </div>
            <button
              onClick={handleSaveNotifications}
              disabled={saving}
              className="px-4 py-2 bg-[#E63946] text-white text-sm font-medium rounded-xl hover:bg-[#c62d38] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>

          <div className="space-y-6">
            {/* Email Notifications */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail size={16} className="text-blue-500" />
                <h3 className="text-sm font-semibold text-[#1D3557]">Email Notifications</h3>
              </div>
              <div className="space-y-3 pl-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Order Updates</p>
                    <p className="text-xs text-gray-400">Order confirmations, shipping, delivery</p>
                  </div>
                  <Toggle
                    checked={notifications.emailOrderUpdates}
                    onChange={(val) =>
                      setNotifications((n) => ({ ...n, emailOrderUpdates: val }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Promotions & Offers</p>
                    <p className="text-xs text-gray-400">Sales, discounts, new products</p>
                  </div>
                  <Toggle
                    checked={notifications.emailPromotions}
                    onChange={(val) =>
                      setNotifications((n) => ({ ...n, emailPromotions: val }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Newsletter</p>
                    <p className="text-xs text-gray-400">Weekly design tips and updates</p>
                  </div>
                  <Toggle
                    checked={notifications.emailNewsletter}
                    onChange={(val) =>
                      setNotifications((n) => ({ ...n, emailNewsletter: val }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* SMS Notifications */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle size={16} className="text-green-500" />
                <h3 className="text-sm font-semibold text-[#1D3557]">SMS Notifications</h3>
              </div>
              <div className="space-y-3 pl-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Order Updates</p>
                    <p className="text-xs text-gray-400">Important order status via SMS</p>
                  </div>
                  <Toggle
                    checked={notifications.smsOrderUpdates}
                    onChange={(val) =>
                      setNotifications((n) => ({ ...n, smsOrderUpdates: val }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Promotions</p>
                    <p className="text-xs text-gray-400">SMS for exclusive deals</p>
                  </div>
                  <Toggle
                    checked={notifications.smsPromotions}
                    onChange={(val) =>
                      setNotifications((n) => ({ ...n, smsPromotions: val }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Notifications */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle size={16} className="text-emerald-500" />
                <h3 className="text-sm font-semibold text-[#1D3557]">WhatsApp Notifications</h3>
              </div>
              <div className="space-y-3 pl-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Order Updates</p>
                    <p className="text-xs text-gray-400">Track your orders on WhatsApp</p>
                  </div>
                  <Toggle
                    checked={notifications.whatsappOrderUpdates}
                    onChange={(val) =>
                      setNotifications((n) => ({ ...n, whatsappOrderUpdates: val }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Promotions</p>
                    <p className="text-xs text-gray-400">Deals and offers on WhatsApp</p>
                  </div>
                  <Toggle
                    checked={notifications.whatsappPromotions}
                    onChange={(val) =>
                      setNotifications((n) => ({ ...n, whatsappPromotions: val }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-[#1D3557] flex items-center gap-2">
                <Globe size={18} />
                General Preferences
              </h2>
              <p className="text-xs text-gray-500 mt-1">Customize your experience</p>
            </div>
            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="px-4 py-2 bg-[#E63946] text-white text-sm font-medium rounded-xl hover:bg-[#c62d38] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <div className="relative">
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50 appearance-none"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                  ₹
                </span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50 appearance-none"
                >
                  {CURRENCIES.map((cur) => (
                    <option key={cur.code} value={cur.code}>
                      {cur.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
            <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Language & Currency</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Language preference affects the website interface. Currency preference sets your
                default price display but orders are processed in INR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
