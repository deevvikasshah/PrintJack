import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Edit2, Trash2, Eye, EyeOff, Search, Calendar,
  Image as ImageIcon, Tag, ChevronDown,
} from 'lucide-react';
import { get, post, put, del } from '../../utils/api';
import { formatDate, slugify } from '../../utils/formatters';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const emptyPost = {
  title: '', slug: '', content: '', excerpt: '', featuredImage: '',
  category: '', tags: '', status: 'draft',
  metaTitle: '', metaDescription: '',
};

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState({ ...emptyPost });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const limit = 15;

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit, sort: '-createdAt' };
      if (search) params.search = search;
      const { data } = await get('/admin/blog', { params });
      setPosts(data.posts || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openAddForm = () => {
    setEditingPost(null);
    setForm({ ...emptyPost });
    setShowForm(true);
  };

  const openEditForm = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      featuredImage: post.featuredImage || '',
      category: post.category || '',
      tags: post.tags?.join(', ') || '',
      status: post.status || 'draft',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
    });
    setShowForm(true);
  };

  const handleTitleChange = (title) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : slugify(title),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    try {
      setSaving(true);
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (editingPost) {
        await put(`/admin/blog/${editingPost._id}`, payload);
        toast.success('Post updated');
      } else {
        await post('/admin/blog', payload);
        toast.success('Post created');
      }
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await del(`/admin/blog/${postId}`);
      setDeleteConfirm(null);
      fetchPosts();
      toast.success('Post deleted');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const togglePublish = async (post) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      await put(`/admin/blog/${post._id}`, { status: newStatus });
      fetchPosts();
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#1D3557]">Blog Management</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2 bg-[#E63946] text-white text-sm font-medium rounded-xl hover:bg-[#c62d38] transition-colors"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
        />
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12"><Loading fullPage={false} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Author</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Views</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Published</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No posts found</td></tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {post.featuredImage ? (
                                <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <FileText size={14} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[#1D3557] truncate max-w-[300px]">{post.title}</p>
                              <p className="text-xs text-gray-400">/{post.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{post.author?.name || 'Admin'}</td>
                        <td className="px-4 py-3 text-gray-500">{post.views || 0}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {post.publishedAt ? formatDate(post.publishedAt) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPreviewPost(post)}
                              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => togglePublish(post)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                post.status === 'published'
                                  ? 'text-green-500 hover:bg-green-50'
                                  : 'text-yellow-500 hover:bg-yellow-50'
                              }`}
                              title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                            >
                              {post.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                              onClick={() => openEditForm(post)}
                              className="p-1.5 text-gray-400 hover:text-[#1D3557] hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(post)}
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
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingPost ? 'Edit Post' : 'New Post'} size="full">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1D3557] mb-1">Content *</label>
            <textarea
              rows={12}
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946]"
              placeholder="Write your post content here (Markdown supported)..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1D3557] mb-1">Excerpt</label>
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              placeholder="Brief summary of the post..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1D3557] mb-1">Featured Image URL</label>
            <input
              type="text"
              value={form.featuredImage}
              onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                placeholder="design, printing, tips"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* SEO */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-[#1D3557] mb-3">SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Meta Title</label>
                <input type="text" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Meta Description</label>
                <textarea rows={2} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-[#E63946] rounded-xl hover:bg-[#c62d38] disabled:opacity-50">
              {saving ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={!!previewPost} onClose={() => setPreviewPost(null)} title="Preview" size="xl">
        {previewPost && (
          <div className="space-y-4">
            {previewPost.featuredImage && (
              <img src={previewPost.featuredImage} alt="" className="w-full h-48 object-cover rounded-xl" />
            )}
            <div>
              <h2 className="text-xl font-bold text-[#1D3557]">{previewPost.title}</h2>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span>{previewPost.author?.name || 'Admin'}</span>
                <span>&middot;</span>
                <span>{formatDate(previewPost.publishedAt || previewPost.createdAt)}</span>
                {previewPost.category && <><span>&middot;</span><span>{previewPost.category}</span></>}
              </div>
            </div>
            {previewPost.excerpt && (
              <p className="text-gray-500 italic border-l-4 border-[#E63946] pl-4">{previewPost.excerpt}</p>
            )}
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{previewPost.content}</div>
            {previewPost.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {previewPost.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Post" size="sm">
        {deleteConfirm && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This action cannot be undone.
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
