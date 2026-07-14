import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Building,
  Star,
  Loader2,
} from 'lucide-react';
import api from '../../utils/api';
import { INDIAN_STATES } from '../../utils/constants';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

function AddressForm({ onSave, initialData, onCancel, loading }) {
  const [form, setForm] = useState(
    initialData || {
      label: 'Home',
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    }
  );

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.street || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <select
          name="label"
          value={form.label}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
        >
          <option value="Home">Home</option>
          <option value="Office">Office</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            maxLength={10}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
          <input
            type="text"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            required
            maxLength={6}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
          <textarea
            name="street"
            value={form.street}
            onChange={handleChange}
            required
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
          <select
            name="state"
            value={form.state}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#E63946] text-white font-medium rounded-xl hover:bg-[#c62d38] transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {initialData ? 'Update Address' : 'Save Address'}
        </button>
      </div>
    </form>
  );
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/addresses');
      setAddresses(data.addresses || data || []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSave = async (formData) => {
    try {
      setFormLoading(true);
      if (editingAddress) {
        const { data } = await api.put(`/addresses/${editingAddress._id}`, formData);
        setAddresses((prev) => prev.map((a) => (a._id === editingAddress._id ? data.address || data : a)));
        toast.success('Address updated');
      } else {
        const { data } = await api.post('/addresses', formData);
        const newAddr = data.address || data;
        setAddresses((prev) => [...prev, newAddr]);
        toast.success('Address added');
      }
      setShowForm(false);
      setEditingAddress(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/addresses/${id}/default`);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a._id === id }))
      );
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to update default address');
    }
  };

  const getIcon = (label) => {
    if (label === 'Office') return Building;
    return Home;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1D3557]">Address Book</h1>
        <button
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-[#E63946] text-white text-sm font-medium rounded-xl hover:bg-[#c62d38] transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Address
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <EmptyState
          icon={MapPin}
          title="No addresses saved"
          description="Add your addresses for faster checkout."
          actionLabel="Add Address"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const Icon = getIcon(addr.label);
            return (
              <div
                key={addr._id}
                className={`bg-white rounded-2xl border p-5 transition-all ${
                  addr.isDefault ? 'border-[#E63946] shadow-md' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-[#1D3557]">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="ml-2 text-[10px] font-bold text-[#E63946] bg-red-100 px-2 py-0.5 rounded-full uppercase">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700">{addr.fullName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{addr.street}</p>
                  <p className="text-sm text-gray-500">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Phone: {addr.phone}</p>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setEditingAddress(addr);
                      setShowForm(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-[#1D3557] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={12} />
                    Edit
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-[#E63946] hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Star size={12} />
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
        size="lg"
      >
        <AddressForm
          onSave={handleSave}
          initialData={editingAddress}
          loading={formLoading}
          onCancel={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
        />
      </Modal>
    </div>
  );
}
