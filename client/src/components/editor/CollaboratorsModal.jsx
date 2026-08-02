import React, { useState, useEffect, useCallback } from 'react';
import { X, Users, Link2, Mail, Trash2, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../utils/api';
import { formatDistanceToNow } from '../../utils/formatters';

const ROLE_LABELS = {
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
};

export default function CollaboratorsModal({ designId, onClose }) {
  const [collaborators, setCollaborators] = useState([]);
  const [owner, setOwner] = useState(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchCollaborators = useCallback(async () => {
    if (!designId) return;
    try {
      const res = await api.get(`/collaboration/${designId}/collaborators`);
      if (res.data?.success) {
        setCollaborators(res.data.collaborators || []);
        setOwner(res.data.owner || null);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  }, [designId]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setAdding(true);
    try {
      const res = await api.post(`/collaboration/${designId}/collaborators`, {
        email: email.trim(),
        role,
      });
      if (res.data?.success) {
        setEmail('');
        setCollaborators(res.data.collaborators || []);
      } else {
        setError(res.data?.message || 'Failed to add collaborator');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add collaborator. Make sure the email belongs to a registered user.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (userId) => {
    try {
      const res = await api.delete(`/collaboration/${designId}/collaborators/${userId}`);
      if (res.data?.success) {
        setCollaborators(res.data.collaborators || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove collaborator');
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/editor/${designId ? '' : ''}`;
    const shareUrl = designId ? `${window.location.origin}/dashboard/designs` : window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-gray-900">Share & Collaborate</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Invite by Email</h4>
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teammate@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      type="submit"
                      disabled={adding || !email.trim()}
                      className="px-4 py-2 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
                    </button>
                  </div>
                </form>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Team</h4>
                <div className="space-y-2">
                  {owner && (
                    <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {owner.name ? owner.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{owner.name}</p>
                          <p className="text-xs text-gray-400 truncate">{owner.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                        OWNER
                      </span>
                    </div>
                  )}

                  {collaborators.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No collaborators yet. Invite teammates to design together.
                    </p>
                  )}

                  {collaborators.map((c) => (
                    <div key={c._id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {c.user?.name ? c.user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{c.user?.name || 'User'}</p>
                          <p className="text-xs text-gray-400 truncate">{c.user?.email}</p>
                          {c.lastActive && (
                            <p className="text-[10px] text-gray-400">
                              Active {formatDistanceToNow(c.lastActive)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', c.role === 'editor' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600')}>
                          {ROLE_LABELS[c.role] || c.role}
                        </span>
                        <button
                          onClick={() => handleRemove(c.user?._id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove collaborator"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Link2 className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Share Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
