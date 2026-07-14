import React, { useState, useEffect, useCallback } from 'react';
import {
  Ticket, Plus, Edit2, Trash2, Copy, ToggleLeft, ToggleRight, Percent,
  DollarSign, Truck, Calendar, Tag, Hash,
} from 'lucide-react';
import { get, post, put, del } from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const emptyCoupon = {
  code: '', description: '', discountType: 'percentage', discountValue: '',
  minimumOrderAmount: '', maximumDiscountAmount: '', usageLimit: '',
  applicableCategories: [], applicableProducts: [],
  validFrom: '', validTill: '', active: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({ ...emptyCoupon });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 15;

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) params.search = search;
      const { data } = await get('/admin/coupons', { params });
      setCoupons(data.coupons || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'PJ-';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm((prev) => ({ ...prev, code }));
  };

  const openAddForm = () => {
    setEditingCoupon(null);
    setForm({ ...emptyCoupon });
    setShowForm(true);
  };

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || '',
      minimumOrderAmount: coupon.minimumOrderAmount || '',
      maximumDiscountAmount: coupon.maximumDiscountAmount || '',
      usageLimit: coupon.usageLimit || '',
      applicableCategories: coupon.applicableCategories || [],
      applicableProducts: coupon.applicableProducts || [],
      validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
      validTill: coupon.validTill ? coupon.validTill.split('T')[0] : '',
      active: coupon.active !== false,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Coupon code is required');
    try {
      setSaving(true);
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minimumOrderAmount: Number(form.minimumOrderAmount) || 0,
        maximumDiscountAmount: Number(form.maximumDiscountAmount) || 0,
        usageLimit: Number(form.usageLimit) || 0,
      };

      if (editingCoupon) {
        await put(`/admin/coupons/${editingCoupon._id}`, payload);
        toast.success('Coupon updated');
      } else {
        await post('/admin/coupons', payload);
        toast.success('Coupon created');
      }
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (couponId) => {
    try {
      await del(`/admin/coupons/${couponId}`);
      setDeleteConfirm(null);
      fetchCoupons();
      toast.success('Coupon deleted');
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await put(`/admin/coupons/${coupon._id}`, { active: !coupon.active });
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to update coupon');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied');
  };

  const getDiscountIcon = (type) => {
    switch (type) {
      case 'percentage': return <Percent size={14} />;
      case 'fixed': return <DollarSign size={14} />;
      case 'free_shipping': return <Truck size={14} />;
      default: return <Tag size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#1D3557]">Coupon Management</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2 bg-[#E63946] text-white text-sm font-medium rounded-xl hover:bg-[#c62d38] transition-colors"
        >
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Search coupons..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946]"
        />
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12"><Loading fullPage={false} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Code</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Discount</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Min Order</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Usage</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Validity</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {coupons.length === 0 ? (
                    <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No coupons found</td></tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr key={coupon._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#1D3557]">{coupon.code}</span>
                            <button onClick={() => copyCode(coupon.code)} className="p-1 text-gray-400 hover:text-[#E63946]" title="Copy">
                              <Copy size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-gray-600 capitalize">
                            {getDiscountIcon(coupon.discountType)}
                            {coupon.discountType?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1D3557]">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` :
                           coupon.discountType === 'free_shipping' ? 'Free Shipping' :
                           formatPrice(coupon.discountValue)}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{coupon.minimumOrderAmount ? formatPrice(coupon.minimumOrderAmount) : '-'}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {coupon.usageCount || 0}/{coupon.usageLimit || '∞'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {coupon.validFrom && coupon.validTill
                            ? `${formatDate(coupon.validFrom)} - ${formatDate(coupon.validTill)}`
                            : 'No expiry'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActive(coupon)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              coupon.active !== false
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {coupon.active !== false ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                            {coupon.active !== false ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditForm(coupon)}
                              className="p-1.5 text-gray-400 hover:text-[#1D3557] hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(coupon)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-[#1D3557] mb-1">Coupon Code *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
              />
              <button type="button" onClick={generateCode} className="px-4 py-2 bg-gray-100 text-sm text-gray-600 rounded-xl hover:bg-gray-200 whitespace-nowrap">
                Auto Generate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1D3557] mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
            />
          </div>

          {/* Discount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Discount Type *</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Discount Value *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                placeholder={form.discountType === 'percentage' ? 'e.g. 10' : 'e.g. 100'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Max Discount</label>
              <input
                type="number"
                min="0"
                value={form.maximumDiscountAmount}
                onChange={(e) => setForm({ ...form, maximumDiscountAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                placeholder="For percentage coupons"
              />
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Minimum Order Amount</label>
              <input
                type="number"
                min="0"
                value={form.minimumOrderAmount}
                onChange={(e) => setForm({ ...form, minimumOrderAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Usage Limit</label>
              <input
                type="number"
                min="0"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                placeholder="0 = unlimited"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-[#1D3557] mb-1">Applicable Categories</label>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map((cat) => (
                <label
                  key={cat.slug}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-colors ${
                    form.applicableCategories.includes(cat.slug)
                      ? 'bg-[#E63946] text-white border-[#E63946]'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.applicableCategories.includes(cat.slug)}
                    onChange={() => {
                      const updated = form.applicableCategories.includes(cat.slug)
                        ? form.applicableCategories.filter((c) => c !== cat.slug)
                        : [...form.applicableCategories, cat.slug];
                      setForm({ ...form, applicableCategories: updated });
                    }}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
            {form.applicableCategories.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">Selected: {form.applicableCategories.length} categories</p>
            )}
          </div>

          {/* Validity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Valid From</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Valid Till</label>
              <input
                type="date"
                value={form.validTill}
                onChange={(e) => setForm({ ...form, validTill: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="coupon-active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]"
            />
            <label htmlFor="coupon-active" className="text-sm text-gray-600">Active</label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-[#E63946] rounded-xl hover:bg-[#c62d38] disabled:opacity-50">
              {saving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Coupon" size="sm">
        {deleteConfirm && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete coupon <strong className="font-mono">{deleteConfirm.code}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm._id)} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600">Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
