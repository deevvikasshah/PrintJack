import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PenTool,
  Edit2,
  Trash2,
  Copy,
  Download,
  Send,
  ExternalLink,
  Filter,
  Loader2,
} from 'lucide-react';
import api from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'saved', label: 'Saved' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  saved: 'bg-blue-100 text-blue-700',
  submitted: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function DesignCard({ design, onDelete, onDuplicate, onSubmit }) {
  const previewImage = design.previewImage || design.thumbnail || '/placeholder-design.png';
  const productName = design.product?.name || design.productName || 'Custom Product';
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-all">
      {/* Preview */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={previewImage}
          alt={design.name || 'Design'}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {!imgLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
              STATUS_COLORS[design.status] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {design.status || 'draft'}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-2">
            <Link
              to={`/editor/${design.product?._id || design.productId}`}
              className="flex-1 text-center bg-white/90 backdrop-blur text-[#1D3557] text-xs font-semibold py-2 rounded-lg hover:bg-white transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-[#1D3557] text-sm line-clamp-1">
          {design.name || 'Untitled Design'}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{productName}</p>
        <p className="text-[10px] text-gray-400 mt-1">
          {formatDate(design.updatedAt || design.createdAt)}
        </p>

        {/* Actions */}
        <div className="flex gap-1.5 mt-3">
          <Link
            to={`/editor/${design.product?._id || design.productId}`}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 size={12} />
            Edit
          </Link>
          {design.status !== 'submitted' && design.status !== 'approved' && (
            <button
              onClick={() => onDuplicate(design._id)}
              className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-50 transition-colors"
              title="Duplicate"
            >
              <Copy size={12} />
            </button>
          )}
          {design.status !== 'submitted' && design.status !== 'approved' && (
            <button
              onClick={() => onSubmit(design._id)}
              className="flex items-center justify-center px-3 py-2 border border-[#E63946] text-[#E63946] text-xs rounded-lg hover:bg-red-50 transition-colors"
              title="Submit for Print"
            >
              <Send size={12} />
            </button>
          )}
          <button
            onClick={() => onDelete(design._id)}
            className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-400 text-xs rounded-lg hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DesignsPage() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDesigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 12 };
      if (activeTab !== 'all') params.status = activeTab;
      const { data } = await api.get('/designs/my', { params });
      setDesigns(data.designs || data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this design?')) return;
    try {
      setActionLoading(id);
      await api.delete(`/designs/${id}`);
      toast.success('Design deleted');
      fetchDesigns();
    } catch {
      toast.error('Failed to delete design');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      setActionLoading(id);
      await api.post(`/designs/${id}/duplicate`);
      toast.success('Design duplicated');
      fetchDesigns();
    } catch {
      toast.error('Failed to duplicate design');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id) => {
    try {
      setActionLoading(id);
      await api.post(`/designs/${id}/submit`);
      toast.success('Design submitted for print review');
      fetchDesigns();
    } catch {
      toast.error('Failed to submit design');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1D3557]">My Designs</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-[#E63946] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Designs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : designs.length === 0 ? (
        <EmptyState
          icon={PenTool}
          title="No designs yet"
          description="Start customizing products and save your designs here!"
          actionLabel="Start Designing"
          actionTo="/products"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {designs.map((design) => (
              <div key={design._id} className="relative">
                {actionLoading === design._id && (
                  <div className="absolute inset-0 bg-white/60 rounded-2xl z-10 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-[#E63946]" />
                  </div>
                )}
                <DesignCard
                  design={design}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onSubmit={handleSubmit}
                />
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
