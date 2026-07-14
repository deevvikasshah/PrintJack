import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Edit2, Trash2, Eye, Star, ChevronDown, Upload, X as XIcon,
  GripVertical, Image as ImageIcon, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { get, post, put, del } from '../../utils/api';
import { formatPrice, getStatusColor, getStatusLabel, slugify } from '../../utils/formatters';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const emptyProduct = {
  name: '', description: '', category: '', subCategory: '', basePrice: '',
  bulkPricing: [{ minQty: '', price: '' }],
  colors: [{ name: '', hex: '#000000', available: true }],
  sizes: [{ name: '', available: true }],
  material: '', printingMethod: '',
  printAreas: [{ name: '', width: '', height: '', description: '', acceptedFormats: '' }],
  tags: '', specifications: [{ key: '', value: '' }],
  minimumOrderQuantity: '', featured: false,
  metaTitle: '', metaDescription: '', stockStatus: 'in_stock',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const limit = 15;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit, sort: '-createdAt' };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const { data } = await get('/admin/products', { params });
      setProducts(data.products || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAddForm = () => {
    setEditingProduct(null);
    setForm({ ...emptyProduct });
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      basePrice: product.basePrice || '',
      bulkPricing: product.bulkPricing?.length ? product.bulkPricing : [{ minQty: '', price: '' }],
      colors: product.colors?.length ? product.colors : [{ name: '', hex: '#000000', available: true }],
      sizes: product.sizes?.length ? product.sizes : [{ name: '', available: true }],
      material: product.material || '',
      printingMethod: product.printingMethod || '',
      printAreas: product.printAreas?.length ? product.printAreas : [{ name: '', width: '', height: '', description: '', acceptedFormats: '' }],
      tags: product.tags?.join(', ') || '',
      specifications: product.specifications?.length ? product.specifications : [{ key: '', value: '' }],
      minimumOrderQuantity: product.minimumOrderQuantity || '',
      featured: product.featured || false,
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      stockStatus: product.stockStatus || 'in_stock',
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        minimumOrderQuantity: Number(form.minimumOrderQuantity) || 1,
        bulkPricing: form.bulkPricing.filter((b) => b.minQty && b.price).map((b) => ({ minQty: Number(b.minQty), price: Number(b.price) })),
        colors: form.colors.filter((c) => c.name),
        sizes: form.sizes.filter((s) => s.name),
        printAreas: form.printAreas.filter((p) => p.name).map((p) => ({ ...p, width: Number(p.width), height: Number(p.height) })),
        specifications: form.specifications.filter((s) => s.key && s.value),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (editingProduct) {
        await put(`/admin/products/${editingProduct._id}`, payload);
        toast.success('Product updated');
      } else {
        await post('/admin/products', payload);
        toast.success('Product created');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await del(`/admin/products/${productId}`);
      setDeleteConfirm(null);
      fetchProducts();
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const updateFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addBulkPricingRow = () => {
    setForm((prev) => ({ ...prev, bulkPricing: [...prev.bulkPricing, { minQty: '', price: '' }] }));
  };

  const removeBulkPricingRow = (index) => {
    setForm((prev) => ({ ...prev, bulkPricing: prev.bulkPricing.filter((_, i) => i !== index) }));
  };

  const updateBulkPricing = (index, field, value) => {
    const updated = [...form.bulkPricing];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, bulkPricing: updated }));
  };

  const addColor = () => {
    setForm((prev) => ({ ...prev, colors: [...prev.colors, { name: '', hex: '#000000', available: true }] }));
  };

  const removeColor = (index) => {
    setForm((prev) => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }));
  };

  const updateColor = (index, field, value) => {
    const updated = [...form.colors];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, colors: updated }));
  };

  const addSize = () => {
    setForm((prev) => ({ ...prev, sizes: [...prev.sizes, { name: '', available: true }] }));
  };

  const removeSize = (index) => {
    setForm((prev) => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }));
  };

  const updateSize = (index, field, value) => {
    const updated = [...form.sizes];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, sizes: updated }));
  };

  const addPrintArea = () => {
    setForm((prev) => ({
      ...prev,
      printAreas: [...prev.printAreas, { name: '', width: '', height: '', description: '', acceptedFormats: '' }],
    }));
  };

  const removePrintArea = (index) => {
    setForm((prev) => ({ ...prev, printAreas: prev.printAreas.filter((_, i) => i !== index) }));
  };

  const updatePrintArea = (index, field, value) => {
    const updated = [...form.printAreas];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, printAreas: updated }));
  };

  const addSpec = () => {
    setForm((prev) => ({ ...prev, specifications: [...prev.specifications, { key: '', value: '' }] }));
  };

  const removeSpec = (index) => {
    setForm((prev) => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));
  };

  const updateSpec = (index, field, value) => {
    const updated = [...form.specifications];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, specifications: updated }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#1D3557]">Product Management</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2 bg-[#E63946] text-white text-sm font-medium rounded-xl hover:bg-[#c62d38] transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none"
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12"><Loading fullPage={false} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Bulk Price</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Stock</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Featured</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Rating</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.length === 0 ? (
                    <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No products found</td></tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <ImageIcon size={16} />
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-[#1D3557] truncate max-w-[200px]">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 capitalize">{product.category?.replace(/-/g, ' ')}</td>
                        <td className="px-4 py-3 font-medium text-[#1D3557]">{formatPrice(product.basePrice)}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {product.bulkPricing?.length > 0 ? `${product.bulkPricing.length} tiers` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.stockStatus === 'in_stock' ? 'bg-green-100 text-green-700' :
                            product.stockStatus === 'out_of_stock' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {product.stockStatus?.replace(/_/g, ' ') || 'In Stock'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {product.featured ? (
                            <Star size={16} className="text-yellow-500" fill="currentColor" />
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{product.averageRating?.toFixed(1) || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditForm(product)}
                              className="p-1.5 text-gray-400 hover:text-[#1D3557] hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(product)}
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

      {/* Add/Edit Product Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingProduct ? 'Edit Product' : 'Add Product'} size="full">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => updateFormField('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Category *</label>
              <select
                required
                value={form.category}
                onChange={(e) => updateFormField('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              >
                <option value="">Select Category</option>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1D3557] mb-1">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Sub Category</label>
              <input type="text" value={form.subCategory} onChange={(e) => updateFormField('subCategory', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Material</label>
              <input type="text" value={form.material} onChange={(e) => updateFormField('material', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Printing Method</label>
              <input type="text" value={form.printingMethod} onChange={(e) => updateFormField('printingMethod', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-[#1D3557] mb-3">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Base Price (₹) *</label>
                <input type="number" required min="0" step="0.01" value={form.basePrice} onChange={(e) => updateFormField('basePrice', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Min Order Quantity</label>
                <input type="number" min="1" value={form.minimumOrderQuantity} onChange={(e) => updateFormField('minimumOrderQuantity', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-600">Bulk Pricing Tiers</label>
                <button type="button" onClick={addBulkPricingRow} className="text-xs text-[#E63946] hover:underline">+ Add Tier</button>
              </div>
              {form.bulkPricing.map((tier, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input type="number" placeholder="Min Qty" value={tier.minQty} onChange={(e) => updateBulkPricing(i, 'minQty', e.target.value)} className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                  <span className="text-gray-400">→</span>
                  <input type="number" placeholder="Price (₹)" value={tier.price} onChange={(e) => updateBulkPricing(i, 'price', e.target.value)} className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                  {form.bulkPricing.length > 1 && (
                    <button type="button" onClick={() => removeBulkPricingRow(i)} className="p-1 text-gray-400 hover:text-red-500"><XIcon size={14} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1D3557]">Colors</h3>
              <button type="button" onClick={addColor} className="text-xs text-[#E63946] hover:underline">+ Add Color</button>
            </div>
            {form.colors.map((color, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <input type="color" value={color.hex} onChange={(e) => updateColor(i, 'hex', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input type="text" placeholder="Color name" value={color.name} onChange={(e) => updateColor(i, 'name', e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                <button type="button" onClick={() => updateColor(i, 'available', !color.available)} className={`p-1 ${color.available ? 'text-green-500' : 'text-gray-300'}`}>
                  {color.available ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
                {form.colors.length > 1 && (
                  <button type="button" onClick={() => removeColor(i)} className="p-1 text-gray-400 hover:text-red-500"><XIcon size={14} /></button>
                )}
              </div>
            ))}
          </div>

          {/* Sizes */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1D3557]">Sizes</h3>
              <button type="button" onClick={addSize} className="text-xs text-[#E63946] hover:underline">+ Add Size</button>
            </div>
            {form.sizes.map((size, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <input type="text" placeholder="Size name" value={size.name} onChange={(e) => updateSize(i, 'name', e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                <button type="button" onClick={() => updateSize(i, 'available', !size.available)} className={`p-1 ${size.available ? 'text-green-500' : 'text-gray-300'}`}>
                  {size.available ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
                {form.sizes.length > 1 && (
                  <button type="button" onClick={() => removeSize(i)} className="p-1 text-gray-400 hover:text-red-500"><XIcon size={14} /></button>
                )}
              </div>
            ))}
          </div>

          {/* Print Areas */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1D3557]">Print Areas</h3>
              <button type="button" onClick={addPrintArea} className="text-xs text-[#E63946] hover:underline">+ Add Print Area</button>
            </div>
            {form.printAreas.map((area, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <input type="text" placeholder="Name" value={area.name} onChange={(e) => updatePrintArea(i, 'name', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                    <input type="number" placeholder="Width (px)" value={area.width} onChange={(e) => updatePrintArea(i, 'width', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                    <input type="number" placeholder="Height (px)" value={area.height} onChange={(e) => updatePrintArea(i, 'height', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                    <input type="text" placeholder="Accepted formats" value={area.acceptedFormats} onChange={(e) => updatePrintArea(i, 'acceptedFormats', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                  </div>
                  {form.printAreas.length > 1 && (
                    <button type="button" onClick={() => removePrintArea(i)} className="ml-2 p-1 text-gray-400 hover:text-red-500"><XIcon size={14} /></button>
                  )}
                </div>
                <input type="text" placeholder="Description" value={area.description} onChange={(e) => updatePrintArea(i, 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              </div>
            ))}
          </div>

          {/* Specifications */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1D3557]">Specifications</h3>
              <button type="button" onClick={addSpec} className="text-xs text-[#E63946] hover:underline">+ Add Spec</button>
            </div>
            {form.specifications.map((spec, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input type="text" placeholder="Key" value={spec.key} onChange={(e) => updateSpec(i, 'key', e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                <input type="text" placeholder="Value" value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                {form.specifications.length > 1 && (
                  <button type="button" onClick={() => removeSpec(i)} className="p-1 text-gray-400 hover:text-red-500"><XIcon size={14} /></button>
                )}
              </div>
            ))}
          </div>

          {/* Tags & Featured */}
          <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={(e) => updateFormField('tags', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" placeholder="trending, new, sale" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Stock Status</label>
              <select value={form.stockStatus} onChange={(e) => updateFormField('stockStatus', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="pre_order">Pre-Order</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => updateFormField('featured', e.target.checked)} className="rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]" />
            <label htmlFor="featured" className="text-sm font-medium text-gray-600">Featured Product</label>
          </div>

          {/* SEO */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-[#1D3557] mb-3">SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Meta Title</label>
                <input type="text" value={form.metaTitle} onChange={(e) => updateFormField('metaTitle', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Meta Description</label>
                <textarea rows={2} value={form.metaDescription} onChange={(e) => updateFormField('metaDescription', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2 text-sm font-medium text-white bg-[#E63946] rounded-xl hover:bg-[#c62d38] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Product" size="sm">
        {deleteConfirm && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm._id)} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
