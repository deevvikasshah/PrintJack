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
  Clock,
  Users,
  Calculator,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus,
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

function DesignCard({ design, onDelete, onDuplicate, onSubmit, onVersions, onCollaborate, onCalculate }) {
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
          <button
            onClick={() => onVersions(design._id)}
            className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-400 text-xs rounded-lg hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-colors"
            title="Version History"
          >
            <Clock size={12} />
          </button>
          <button
            onClick={() => onCollaborate(design._id)}
            className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-400 text-xs rounded-lg hover:text-green-500 hover:border-green-200 hover:bg-green-50 transition-colors"
            title="Collaborate"
          >
            <Users size={12} />
          </button>
          <button
            onClick={() => onCalculate(design._id)}
            className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-400 text-xs rounded-lg hover:text-[#E63946] hover:border-[#E63946]/20 hover:bg-red-50 transition-colors"
            title="Price Calculator"
          >
            <Calculator size={12} />
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
  const [showVersions, setShowVersions] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculation, setCalculation] = useState(null);
  const [selectedDesignId, setSelectedDesignId] = useState(null);

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

  const handleVersions = async (id) => {
    try {
      const { data } = await api.get(`/designs/${id}/versions`);
      setVersionHistory(data.versions || []);
      setSelectedDesignId(id);
      setShowVersions(true);
    } catch {
      toast.error('Failed to load version history');
    }
  };

  const handleCollaborate = async (id) => {
    try {
      const { data } = await api.get(`/collaboration/${id}/collaborators`);
      setCollaborators(data.collaborators || []);
      setSelectedDesignId(id);
      setShowCollaborators(true);
    } catch {
      toast.error('Failed to load collaborators');
    }
  };

  const handleCalculate = async (id) => {
    try {
      const { data } = await api.get(`/products/${id}/calculate`);
      setCalculation(data.calculation);
      setSelectedDesignId(id);
      setShowCalculator(true);
    } catch {
      toast.error('Failed to calculate price');
    }
  };

  return (
    <>
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
                  onVersions={handleVersions}
                  onCollaborate={handleCollaborate}
                  onCalculate={handleCalculate}
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

    {/* Version History Modal */}
    <Modal isOpen={showVersions} onClose={() => setShowVersions(false)} title="Version History">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {versionHistory.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No versions yet</p>
        ) : (
          versionHistory.map((v) => (
            <div key={v.versionNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">Version {v.versionNumber}</p>
                <p className="text-xs text-gray-500">{formatDate(v.createdAt)}</p>
                {v.changeNote && <p className="text-xs text-gray-400 mt-1">{v.changeNote}</p>}
              </div>
              <button
                onClick={() => {
                  toast.info(`Reverting to version ${v.versionNumber}`);
                  setShowVersions(false);
                }}
                className="p-2 text-gray-400 hover:text-[#E63946] hover:bg-red-50 rounded-lg transition-colors"
                title="Revert to this version"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </Modal>

    {/* Collaborators Modal */}
    <Modal isOpen={showCollaborators} onClose={() => setShowCollaborators(false)} title="Collaborators">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {collaborators.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No collaborators yet</p>
        ) : (
          collaborators.map((c) => (
            <div key={c.user?._id || c.user} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#E63946] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {(c.user?.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 capitalize">{c.role}</p>
                </div>
              </div>
              <span className={`w-2 h-2 rounded-full ${c.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
          ))
        )}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="User ID to add"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  try {
                    await api.post(`/collaboration/${selectedDesignId}/collaborators`, { userId: e.target.value.trim(), role: 'editor' });
                    toast.success('Collaborator added');
                    setShowCollaborators(false);
                  } catch {
                    toast.error('Failed to add collaborator');
                  }
                }
              }}
            />
            <button
              onClick={async () => {
                try {
                  await api.post(`/collaboration/${selectedDesignId}/collaborators`, { role: 'editor' });
                  toast.success('Collaborator added');
                  setShowCollaborators(false);
                } catch {
                  toast.error('Failed to add collaborator');
                }
              }}
              className="px-4 py-2 bg-[#E63946] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </Modal>

    {/* Calculator Modal */}
    <Modal isOpen={showCalculator} onClose={() => setShowCalculator(false)} title="Price Calculator">
      {calculation ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500">Base Price</p>
              <p className="text-lg font-bold text-gray-900">₹{calculation.priceBreakdown.basePrice}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500">Dimensions</p>
              <p className="text-lg font-bold text-gray-900">{calculation.dimensions.width}x{calculation.dimensions.height}{calculation.dimensions.unit}</p>
            </div>
          </div>
          {calculation.priceBreakdown.inkCost > 0 && (
            <div className="flex justify-between text-sm"><span className="text-gray-600">Ink Cost</span><span className="font-medium">₹{calculation.priceBreakdown.inkCost}</span></div>
          )}
          {calculation.priceBreakdown.paperCost > 0 && (
            <div className="flex justify-between text-sm"><span className="text-gray-600">Paper Cost</span><span className="font-medium">₹{calculation.priceBreakdown.paperCost}</span></div>
          )}
          {calculation.priceBreakdown.laminationCost > 0 && (
            <div className="flex justify-between text-sm"><span className="text-gray-600">Lamination</span><span className="font-medium">₹{calculation.priceBreakdown.laminationCost}</span></div>
          )}
          {calculation.priceBreakdown.finishingCost > 0 && (
            <div className="flex justify-between text-sm"><span className="text-gray-600">Finishing</span><span className="font-medium">₹{calculation.priceBreakdown.finishingCost}</span></div>
          )}
          {calculation.priceBreakdown.setupCost > 0 && (
            <div className="flex justify-between text-sm"><span className="text-gray-600">Setup</span><span className="font-medium">₹{calculation.priceBreakdown.setupCost}</span></div>
          )}
          {calculation.priceBreakdown.shippingCost > 0 && (
            <div className="flex justify-between text-sm"><span className="text-gray-600">Shipping</span><span className="font-medium">₹{calculation.priceBreakdown.shippingCost}</span></div>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-[#E63946]">₹{calculation.priceBreakdown.finalPrice}</span>
          </div>
          {calculation.deliveryEstimate && (
            <p className="text-xs text-gray-500 text-center">Est. delivery: {calculation.deliveryEstimate.minDays}-{calculation.deliveryEstimate.maxDays} days</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">Select a design to see pricing</p>
      )}
     </Modal>
    </>
    );
  }
