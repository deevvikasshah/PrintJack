import React, { useState, useEffect } from 'react';
import {
  FolderTree, ChevronRight, ChevronDown, Plus, Edit2, Trash2, GripVertical,
  Eye, EyeOff, Image as ImageIcon,
} from 'lucide-react';
import { get, post, put, del } from '../../utils/api';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', parentCategory: '', sortOrder: 0, active: true, image: '' });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await get('/admin/categories');
      setCategories(data.categories || data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddForm = (parentId = '') => {
    setEditingCategory(null);
    setForm({ name: '', description: '', parentCategory: parentId, sortOrder: 0, active: true, image: '' });
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || '',
      description: category.description || '',
      parentCategory: category.parentCategory || '',
      sortOrder: category.sortOrder || 0,
      active: category.active !== false,
      image: category.image || '',
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...form, sortOrder: Number(form.sortOrder) };

      if (editingCategory) {
        await put(`/admin/categories/${editingCategory._id}`, payload);
        toast.success('Category updated');
      } else {
        await post('/admin/categories', payload);
        toast.success('Category created');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await del(`/admin/categories/${categoryId}`);
      setDeleteConfirm(null);
      fetchCategories();
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const toggleActive = async (category) => {
    try {
      await put(`/admin/categories/${category._id}`, { active: !category.active });
      fetchCategories();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const buildTree = (items, parentId = null) => {
    return items
      .filter((item) => (item.parentCategory || null) === parentId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  };

  const parentCategories = buildTree(categories, null);

  const renderCategory = (category, depth = 0) => {
    const children = categories.filter((c) => c.parentCategory === category._id);
    const isExpanded = expanded[category._id];

    return (
      <div key={category._id}>
        <div
          className={`flex items-center gap-2 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 ${depth > 0 ? 'ml-' + (depth * 8) : ''}`}
          style={{ paddingLeft: `${depth * 32 + 16}px` }}
        >
          {children.length > 0 ? (
            <button onClick={() => toggleExpand(category._id)} className="p-0.5 text-gray-400 hover:text-gray-600">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="w-6" />
          )}

          <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {category.image ? (
              <img src={category.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <FolderTree size={14} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${category.active !== false ? 'text-[#1D3557]' : 'text-gray-400'}`}>
              {category.name}
            </p>
            {category.description && (
              <p className="text-xs text-gray-400 truncate max-w-sm">{category.description}</p>
            )}
          </div>

          <span className="text-xs text-gray-400 mr-2">#{category.sortOrder || 0}</span>

          <button
            onClick={() => toggleActive(category)}
            className={`p-1.5 rounded-lg transition-colors ${category.active !== false ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
            title={category.active !== false ? 'Active' : 'Inactive'}
          >
            {category.active !== false ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          <button
            onClick={() => openAddForm(category._id)}
            className="p-1.5 text-gray-400 hover:text-[#E63946] hover:bg-red-50 rounded-lg transition-colors"
            title="Add Subcategory"
          >
            <Plus size={14} />
          </button>

          <button
            onClick={() => openEditForm(category)}
            className="p-1.5 text-gray-400 hover:text-[#1D3557] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 size={14} />
          </button>

          <button
            onClick={() => setDeleteConfirm(category)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {isExpanded && children.map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#1D3557]">Category Management</h1>
        <button
          onClick={() => openAddForm()}
          className="flex items-center gap-2 px-4 py-2 bg-[#E63946] text-white text-sm font-medium rounded-xl hover:bg-[#c62d38] transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12"><Loading fullPage={false} /></div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <FolderTree size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No categories yet. Create your first category!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {parentCategories.map((cat) => renderCategory(cat))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingCategory ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1D3557] mb-1">Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1D3557] mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1D3557] mb-1">Image URL</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Parent Category</label>
              <select
                value={form.parentCategory}
                onChange={(e) => setForm({ ...form, parentCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              >
                <option value="">None (Top Level)</option>
                {categories.filter((c) => !c.parentCategory).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cat-active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]"
            />
            <label htmlFor="cat-active" className="text-sm text-gray-600">Active</label>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-[#E63946] rounded-xl hover:bg-[#c62d38] disabled:opacity-50">
              {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Category" size="sm">
        {deleteConfirm && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
              {categories.filter((c) => c.parentCategory === deleteConfirm._id).length > 0 && (
                <span className="text-red-500 block mt-1">This category has subcategories that will also be affected.</span>
              )}
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
