import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Edit2, Mail, Download, Eye, Shield, ShieldOff,
  ChevronDown, ChevronUp, ShoppingBag, Star, MapPin, Phone, Calendar,
} from 'lucide-react';
import { get, put, post } from '../../utils/api';
import { formatDate, getInitials } from '../../utils/formatters';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [messageModal, setMessageModal] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const limit = 15;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await get('/admin/users', { params });
      setUsers(data.users || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateRole = async (userId) => {
    try {
      await put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      setShowRoleModal(null);
      toast.success('Role updated');
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const toggleActive = async (user) => {
    try {
      await put(`/admin/users/${user._id}/toggle-active`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return toast.error('Message is required');
    try {
      await post(`/admin/users/${messageModal._id}/message`, { message: messageText });
      setMessageModal(null);
      setMessageText('');
      toast.success('Message sent');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const exportUsers = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Orders', 'Loyalty Points', 'Joined', 'Status'];
    const rows = users.map((u) => [
      u.name,
      u.email,
      u.phone || '',
      u.role,
      u.ordersCount || 0,
      u.loyaltyPoints || 0,
      new Date(u.createdAt).toISOString(),
      u.active !== false ? 'Active' : 'Inactive',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Users exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#1D3557]">User Management</h1>
        <button
          onClick={exportUsers}
          className="flex items-center gap-2 px-4 py-2 bg-[#1D3557] text-white text-sm font-medium rounded-xl hover:bg-[#152840] transition-colors"
        >
          <Download size={16} /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12"><Loading fullPage={false} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">User</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Orders</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Points</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.length === 0 ? (
                    <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No users found</td></tr>
                  ) : (
                    users.map((user) => (
                      <React.Fragment key={user._id}>
                        <tr className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {user.avatar ? (
                                <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                              ) : (
                                <div className="w-9 h-9 bg-gradient-to-br from-[#E63946] to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-bold text-xs">{getInitials(user.name)}</span>
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-[#1D3557] truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{user.phone || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.role === 'admin' && <Shield size={10} />}
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{user.ordersCount || 0}</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-yellow-600">
                              <Star size={12} fill="currentColor" />
                              {user.loyaltyPoints || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(user.createdAt)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleActive(user)}
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {user.active !== false ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                                className="p-1.5 text-gray-400 hover:text-[#1D3557] hover:bg-gray-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                {expandedUser === user._id ? <ChevronUp size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => { setShowRoleModal(user); setNewRole(user.role); }}
                                className="p-1.5 text-gray-400 hover:text-[#1D3557] hover:bg-gray-100 rounded-lg transition-colors"
                                title="Change Role"
                              >
                                <Shield size={14} />
                              </button>
                              <button
                                onClick={() => setMessageModal(user)}
                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Send Message"
                              >
                                <Mail size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded User Details */}
                        {expandedUser === user._id && (
                          <tr>
                            <td colSpan={8} className="px-4 py-4 bg-gray-50/80">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                  <h4 className="text-sm font-semibold text-[#1D3557] mb-3">Profile</h4>
                                  <div className="bg-white rounded-xl p-4 space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Calendar size={14} className="text-gray-400" />
                                      <span className="text-gray-500">Joined:</span>
                                      <span className="font-medium">{formatDate(user.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail size={14} className="text-gray-400" />
                                      <span className="font-medium">{user.email}</span>
                                    </div>
                                    {user.phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" />
                                        <span className="font-medium">{user.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-[#1D3557] mb-3">Addresses</h4>
                                  <div className="space-y-2">
                                    {user.addresses?.length > 0 ? user.addresses.map((addr, i) => (
                                      <div key={i} className="bg-white rounded-xl p-3 text-sm">
                                        <div className="flex items-start gap-2">
                                          <MapPin size={14} className="text-gray-400 mt-0.5" />
                                          <div>
                                            <p className="font-medium">{addr.name}</p>
                                            <p className="text-gray-500 text-xs">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )) : (
                                      <p className="text-sm text-gray-400">No addresses saved</p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-[#1D3557] mb-3">Order History</h4>
                                  <div className="bg-white rounded-xl p-4 text-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                      <ShoppingBag size={14} className="text-gray-400" />
                                      <span className="text-gray-500">Total Orders:</span>
                                      <span className="font-semibold">{user.ordersCount || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Star size={14} className="text-yellow-500" />
                                      <span className="text-gray-500">Loyalty Points:</span>
                                      <span className="font-semibold">{user.loyaltyPoints || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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

      {/* Role Modal */}
      <Modal isOpen={!!showRoleModal} onClose={() => setShowRoleModal(null)} title="Change Role" size="sm">
        {showRoleModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Change role for <strong>{showRoleModal.name}</strong>
            </p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowRoleModal(null)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={() => updateRole(showRoleModal._id)} className="px-4 py-2 text-sm font-medium text-white bg-[#E63946] rounded-xl hover:bg-[#c62d38]">Update</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Message Modal */}
      <Modal isOpen={!!messageModal} onClose={() => { setMessageModal(null); setMessageText(''); }} title={`Message ${messageModal?.name}`}>
        {messageModal && (
          <div className="space-y-4">
            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
              placeholder="Type your message..."
            />
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setMessageModal(null); setMessageText(''); }} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={sendMessage} className="px-4 py-2 text-sm font-medium text-white bg-[#E63946] rounded-xl hover:bg-[#c62d38]">
                <Mail size={14} className="inline mr-1" /> Send
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
