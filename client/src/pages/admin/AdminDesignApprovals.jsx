import React, { useState, useEffect, useCallback } from 'react';
import {
  PenTool, Check, X as XIcon, Download, Eye, Filter, CheckCircle2,
  XCircle, Clock, Image as ImageIcon, Package, ChevronDown,
} from 'lucide-react';
import { get, post } from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

export default function AdminDesignApprovals() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [printSpecs, setPrintSpecs] = useState({ width: '', height: '', resolution: '300', notes: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDesigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filter !== 'all') params.status = filter;
      const { data } = await get('/admin/designs', { params });
      setDesigns(data.designs || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handleApprove = async (designId) => {
    try {
      await post(`/admin/designs/${designId}/approve`, {
        printSpecifications: printSpecs,
        notes: approveNotes,
      });
      setDesigns((prev) => prev.filter((d) => d._id !== designId));
      setApproveModal(null);
      setApproveNotes('');
      setPrintSpecs({ width: '', height: '', resolution: '300', notes: '' });
      toast.success('Design approved');
    } catch (err) {
      toast.error('Failed to approve design');
    }
  };

  const handleReject = async (designId) => {
    if (!rejectReason.trim()) return toast.error('Rejection reason is required');
    try {
      await post(`/admin/designs/${designId}/reject`, { reason: rejectReason });
      setDesigns((prev) => prev.filter((d) => d._id !== designId));
      setRejectModal(null);
      setRejectReason('');
      toast.success('Design rejected');
    } catch (err) {
      toast.error('Failed to reject design');
    }
  };

  const handleApproveAndDownload = async (designId) => {
    try {
      const { data } = await post(`/admin/designs/${designId}/approve`, {
        printSpecifications: printSpecs,
        notes: approveNotes,
        exportPrintFile: true,
      });
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
      setDesigns((prev) => prev.filter((d) => d._id !== designId));
      setApproveModal(null);
      toast.success('Design approved and file exported');
    } catch (err) {
      toast.error('Failed to export');
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return toast.error('Select designs first');
    try {
      await post('/admin/designs/batch-approve', { designIds: selectedIds });
      setDesigns((prev) => prev.filter((d) => !selectedIds.includes(d._id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} designs approved`);
    } catch (err) {
      toast.error('Batch approve failed');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const filterTabs = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'approved', label: 'Approved', icon: CheckCircle2 },
    { key: 'rejected', label: 'Rejected', icon: XCircle },
    { key: 'all', label: 'All', icon: Filter },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#1D3557]">Design Approvals</h1>
        {filter === 'pending' && selectedIds.length > 0 && (
          <button
            onClick={handleBatchApprove}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-colors"
          >
            <Check size={16} /> Batch Approve ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white rounded-2xl p-2 border border-gray-100 shadow-sm w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setFilter(tab.key); setPage(1); setSelectedIds([]); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-[#1D3557] text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Designs Grid/List */}
      {loading ? (
        <div className="py-12"><Loading fullPage={false} /></div>
      ) : designs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <PenTool size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">No {filter !== 'all' ? filter : ''} designs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {designs.map((design) => (
            <div
              key={design._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Design Preview */}
              <div className="relative aspect-square bg-gray-100">
                {design.previewImage || design.thumbnail ? (
                  <img
                    src={design.previewImage || design.thumbnail}
                    alt="Design"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={48} />
                  </div>
                )}

                {/* Status Badge */}
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  design.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  design.status === 'approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {design.status}
                </span>

                {/* Select checkbox (pending only) */}
                {filter === 'pending' && (
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(design._id)}
                      onChange={() => toggleSelect(design._id)}
                      className="rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]"
                    />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setSelectedDesign(design)}
                    className="px-4 py-2 bg-white rounded-xl text-sm font-medium text-[#1D3557] shadow-lg hover:bg-gray-50"
                  >
                    <Eye size={14} className="inline mr-1" /> View
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-sm font-medium text-[#1D3557] truncate">{design.product?.name || 'Custom Design'}</p>
                <p className="text-xs text-gray-400 mt-1">{design.user?.name || 'Unknown User'}</p>
                <p className="text-xs text-gray-400">{formatDate(design.createdAt)}</p>

                {/* Actions */}
                {design.status === 'pending' && (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => { setApproveModal(design); setPrintSpecs({ width: '', height: '', resolution: '300', notes: '' }); }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white text-xs font-medium rounded-xl hover:bg-green-600 transition-colors"
                    >
                      <Check size={12} /> Approve
                    </button>
                    <button
                      onClick={() => setRejectModal(design)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white text-xs font-medium rounded-xl hover:bg-red-600 transition-colors"
                    >
                      <XIcon size={12} /> Reject
                    </button>
                  </div>
                )}
                {design.status === 'approved' && (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => window.open(`/api/admin/designs/${design._id}/export`, '_blank')}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#1D3557] text-white text-xs font-medium rounded-xl hover:bg-[#152840] transition-colors"
                    >
                      <Download size={12} /> Export
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Design Viewer Modal */}
      <Modal isOpen={!!selectedDesign} onClose={() => setSelectedDesign(null)} title="Design Preview" size="xl">
        {selectedDesign && (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              {selectedDesign.previewImage || selectedDesign.canvasData ? (
                <img
                  src={selectedDesign.previewImage || selectedDesign.canvasData}
                  alt="Design"
                  className="w-full max-h-96 object-contain"
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-400">
                  <Package size={48} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Product</p>
                <p className="font-medium text-[#1D3557]">{selectedDesign.product?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">User</p>
                <p className="font-medium text-[#1D3557]">{selectedDesign.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Submitted</p>
                <p className="font-medium text-[#1D3557]">{formatDate(selectedDesign.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  selectedDesign.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  selectedDesign.status === 'approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedDesign.status}
                </span>
              </div>
            </div>
            {selectedDesign.status === 'pending' && (
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => { setApproveModal(selectedDesign); setSelectedDesign(null); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600"
                >
                  <Check size={16} /> Approve
                </button>
                <button
                  onClick={() => { setRejectModal(selectedDesign); setSelectedDesign(null); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600"
                >
                  <XIcon size={16} /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal isOpen={!!approveModal} onClose={() => setApproveModal(null)} title="Approve Design" size="lg">
        {approveModal && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-[#1D3557] mb-3">Print Specifications</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={printSpecs.width}
                    onChange={(e) => setPrintSpecs({ ...printSpecs, width: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={printSpecs.height}
                    onChange={(e) => setPrintSpecs({ ...printSpecs, height: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Resolution (DPI)</label>
                  <input
                    type="number"
                    value={printSpecs.resolution}
                    onChange={(e) => setPrintSpecs({ ...printSpecs, resolution: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
              <textarea
                rows={2}
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
                placeholder="Any notes for the print team..."
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleApprove(approveModal._id)}
                className="flex-1 px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleApproveAndDownload(approveModal._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1D3557] text-white text-sm font-medium rounded-xl hover:bg-[#152840]"
              >
                <Download size={16} /> Approve & Download
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Design" size="sm">
        {rejectModal && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1">Rejection Reason *</label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
                placeholder="Please provide a reason for rejection..."
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleReject(rejectModal._id)}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                Reject Design
              </button>
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="px-4 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
