import React, { useState, useEffect, useRef } from 'react';
import {
  Settings, Save, Globe, CreditCard, Truck, Search as SearchIcon,
  Mail, Share2, Upload, Loader2,
} from 'lucide-react';
import { get, put } from '../../utils/api';
import toast from 'react-hot-toast';
import Loading from '../../components/common/Loading';

const tabs = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'seo', label: 'SEO', icon: SearchIcon },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'social', label: 'Social', icon: Share2 },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const metaRef = useRef({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await get('/admin/settings');
      const flat = {};
      const meta = {};
      (data.settings || []).forEach((s) => {
        flat[s.key] = s.value;
        meta[s.key] = { description: s.description || '', category: s.category || 'general' };
      });
      metaRef.current = meta;
      setSettings(data.settingsMap || flat);
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const bulk = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        ...metaRef.current[key],
      }));
      await put('/admin/settings/bulk', { settings: bulk });
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] || {}), [field]: value },
    }));
  };

  if (loading) return <Loading fullPage={false} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1D3557]">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-[#E63946] text-white text-sm font-medium rounded-xl hover:bg-[#c62d38] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Tab Navigation */}
        <div className="w-56 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-0.5 sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#E63946] text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-[#1D3557]'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium whitespace-nowrap ${
                activeTab === tab.id ? 'text-[#E63946]' : 'text-gray-400'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {/* General */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[#1D3557]">General Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName || ''}
                    onChange={(e) => updateField('siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Logo URL</label>
                  <input
                    type="text"
                    value={settings.siteLogo || ''}
                    onChange={(e) => updateField('siteLogo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Site Description</label>
                <textarea
                  rows={3}
                  value={settings.siteDescription || ''}
                  onChange={(e) => updateField('siteDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail || ''}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={settings.contactPhone || ''}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={settings.gstNumber || ''}
                    onChange={(e) => updateField('gstNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Business Address</label>
                  <input
                    type="text"
                    value={settings.businessAddress || ''}
                    onChange={(e) => updateField('businessAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          {activeTab === 'payment' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[#1D3557]">Payment Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={settings.razorpayKeyId || ''}
                  onChange={(e) => updateField('razorpayKeyId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none font-mono"
                  placeholder="rzp_live_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Razorpay Key Secret</label>
                <input
                  type="password"
                  value={settings.razorpayKeySecret || ''}
                  onChange={(e) => updateField('razorpayKeySecret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none font-mono"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateField('codEnabled', !settings.codEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.codEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.codEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <label className="text-sm font-medium text-gray-600">Cash on Delivery (COD) Enabled</label>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateField('onlinePaymentEnabled', !settings.onlinePaymentEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.onlinePaymentEnabled !== false ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.onlinePaymentEnabled !== false ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <label className="text-sm font-medium text-gray-600">Online Payment Enabled</label>
              </div>
            </div>
          )}

          {/* Shipping */}
          {activeTab === 'shipping' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[#1D3557]">Shipping Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Free Shipping Threshold (₹)</label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold || ''}
                    onChange={(e) => updateField('freeShippingThreshold', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Default Shipping Cost (₹)</label>
                  <input
                    type="number"
                    value={settings.defaultShippingCost || ''}
                    onChange={(e) => updateField('defaultShippingCost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Estimated Delivery (days)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min</label>
                    <input
                      type="number"
                      value={settings.deliveryMinDays || ''}
                      onChange={(e) => updateField('deliveryMinDays', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max</label>
                    <input
                      type="number"
                      value={settings.deliveryMaxDays || ''}
                      onChange={(e) => updateField('deliveryMaxDays', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Shipping Zones</label>
                <textarea
                  rows={4}
                  value={settings.shippingZones || ''}
                  onChange={(e) => updateField('shippingZones', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  placeholder='[{"name":"Zone 1","states":["Delhi","Haryana"],"rate":99}]'
                />
              </div>
            </div>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[#1D3557]">SEO Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Default Meta Title</label>
                <input
                  type="text"
                  value={settings.defaultMetaTitle || ''}
                  onChange={(e) => updateField('defaultMetaTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Default Meta Description</label>
                <textarea
                  rows={3}
                  value={settings.defaultMetaDescription || ''}
                  onChange={(e) => updateField('defaultMetaDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Google Analytics ID</label>
                <input
                  type="text"
                  value={settings.googleAnalyticsId || ''}
                  onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none font-mono"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Google Tag Manager ID</label>
                <input
                  type="text"
                  value={settings.googleTagManagerId || ''}
                  onChange={(e) => updateField('googleTagManagerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none font-mono"
                  placeholder="GTM-XXXXXXX"
                />
              </div>
            </div>
          )}

          {/* Email */}
          {activeTab === 'email' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[#1D3557]">Email Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.smtpHost || ''}
                    onChange={(e) => updateField('smtpHost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">SMTP Port</label>
                  <input
                    type="text"
                    value={settings.smtpPort || ''}
                    onChange={(e) => updateField('smtpPort', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">SMTP Username</label>
                  <input
                    type="text"
                    value={settings.smtpUsername || ''}
                    onChange={(e) => updateField('smtpUsername', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">SMTP Password</label>
                  <input
                    type="password"
                    value={settings.smtpPassword || ''}
                    onChange={(e) => updateField('smtpPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">From Email</label>
                <input
                  type="email"
                  value={settings.fromEmail || ''}
                  onChange={(e) => updateField('fromEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-[#1D3557] mb-3">Notification Toggles</h3>
                <div className="space-y-3">
                  {[
                    { key: 'emailOrderConfirmation', label: 'Order Confirmation' },
                    { key: 'emailShippingUpdate', label: 'Shipping Updates' },
                    { key: 'emailNewUser', label: 'New User Registration' },
                    { key: 'emailLowStock', label: 'Low Stock Alerts' },
                    { key: 'emailDailyReport', label: 'Daily Sales Report' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-3">
                      <button
                        onClick={() => updateField(item.key, !settings[item.key])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[item.key] ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                      <label className="text-sm text-gray-600">{item.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Social */}
          {activeTab === 'social' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[#1D3557]">Social Media Links</h2>
              <div className="space-y-4">
                {[
                  { key: 'facebookUrl', label: 'Facebook URL' },
                  { key: 'instagramUrl', label: 'Instagram URL' },
                  { key: 'twitterUrl', label: 'Twitter / X URL' },
                  { key: 'youtubeUrl', label: 'YouTube URL' },
                  { key: 'linkedinUrl', label: 'LinkedIn URL' },
                  { key: 'pinterestUrl', label: 'Pinterest URL' },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{item.label}</label>
                    <input
                      type="url"
                      value={settings[item.key] || ''}
                      onChange={(e) => updateField(item.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
