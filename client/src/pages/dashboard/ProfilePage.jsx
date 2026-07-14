import React, { useState, useRef } from 'react';
import {
  User,
  Camera,
  Mail,
  Phone,
  Lock,
  Save,
  Loader2,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  Award,
  Calendar,
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, loadUser } = useAuth();
  const fileInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      await api.put('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatarFile(null);
      await loadUser();
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      setSaving(true);
      await updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      });
    } catch {
      // Error handled by updateProfile in AuthContext
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setSaving(true);
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    try {
      setDeleting(true);
      await api.delete('/auth/account');
      toast.success('Account deleted');
      localStorage.removeItem('printjack_token');
      window.location.href = '/';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const sections = [
    { key: 'profile', label: 'Profile Info', icon: User },
    { key: 'password', label: 'Change Password', icon: Lock },
    { key: 'danger', label: 'Account', icon: Shield },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#1D3557] mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Avatar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center mb-4">
            <div className="relative inline-block mb-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[#E63946] to-[#1D3557] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#E63946] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#c62d38] transition-colors"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {avatarFile && (
              <button
                onClick={handleUploadAvatar}
                disabled={saving}
                className="w-full py-2 bg-[#E63946] text-white text-sm font-medium rounded-xl hover:bg-[#c62d38] transition-colors mb-3 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Photo
              </button>
            )}

            <h3 className="font-semibold text-[#1D3557]">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>

            {/* Account Info */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Calendar size={12} />
                <span>Member since {formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs">
                <Award size={12} className="text-yellow-500" />
                <span className="font-medium text-[#1D3557]">
                  {user?.loyaltyTier || 'Bronze'} Tier
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{user?.loyaltyPoints || 0} pts</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-2xl border border-gray-100 p-2">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === section.key
                    ? 'bg-red-50 text-[#E63946]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <section.icon size={16} />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Info */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-[#1D3557] mb-6">Profile Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#E63946] text-white font-medium rounded-xl hover:bg-[#c62d38] transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Change Password */}
          {activeSection === 'password' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-[#1D3557] mb-6">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                      }
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                      }
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#E63946] text-white font-medium rounded-xl hover:bg-[#c62d38] transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                  Change Password
                </button>
              </form>
            </div>
          )}

          {/* Danger Zone */}
          {activeSection === 'danger' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-[#1D3557] mb-2">Account Details</h2>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{user?.phone || 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Member Since</span>
                  <span className="font-medium">{formatDate(user?.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Loyalty Tier</span>
                  <span className="font-medium">{user?.loyaltyTier || 'Bronze'}</span>
                </div>
              </div>

              <div className="border-t border-red-100 pt-6">
                <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <Trash2 size={16} />
                  Delete Account
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-2.5 border border-red-300 text-red-500 font-medium rounded-xl hover:bg-red-50 transition-colors text-sm"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText('');
        }}
        title="Delete Account"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={28} className="text-red-500" />
          </div>
          <p className="text-gray-700 mb-2">
            Are you sure you want to permanently delete your account?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            All your orders, designs, and data will be permanently deleted.
            Type <span className="font-bold text-red-500">DELETE</span> to confirm.
          </p>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:border-red-500 mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
              }}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmText !== 'DELETE'}
              className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Delete Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
