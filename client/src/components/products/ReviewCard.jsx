import { useState } from 'react';
import { Star, ThumbsUp, User, BadgeCheck, X } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ReviewCard({ review, index = 0 }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful?.count ?? review.helpful ?? 0);
  const [voted, setVoted] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState('');

  const rating = review.rating || 0;
  const title = review.title || '';
  const comment = review.comment || '';
  const reviewerName = review.user?.name || review.name || 'Anonymous';
  const reviewerAvatar = review.user?.avatar || '';
  const createdAt = review.createdAt || review.date;
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';
  const photos = review.photos || review.images || [];
  const verified = !!review.verifiedPurchase;
  const productId = review.productId;

  const handleHelpful = async () => {
    if (!productId) {
      setVoted(true);
      setHelpfulCount((c) => c + 1);
      return;
    }
    try {
      const { data } = await api.post(`/products/${productId}/reviews/${review._id}/helpful`);
      if (data?.success) {
        setHelpfulCount(data.helpful);
        setVoted(data.voted);
      }
    } catch (e) {
      toast.error('Please login to mark helpful');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="py-5 border-b border-gray-100 last:border-0"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {reviewerAvatar ? (
            <img
              src={reviewerAvatar}
              alt={reviewerName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-navy-700/10 flex items-center justify-center">
              <User size={18} className="text-navy-700" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-gray-900">{reviewerName}</h4>
              {verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  <BadgeCheck size={11} />
                  Verified
                </span>
              )}
            </div>
            {formattedDate && <p className="text-xs text-gray-400">{formattedDate}</p>}
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < rating
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-200 fill-gray-200'
              }
            />
          ))}
        </div>
      </div>
      {title && (
        <h5 className="mt-3 text-sm font-semibold text-gray-900">{title}</h5>
      )}
      <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{comment}</p>
      {photos.length > 0 && (
        <div className="flex gap-2 mt-3">
          {photos.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setViewerImage(img);
                setViewerOpen(true);
              }}
            >
              <img
                src={img}
                alt="Review image"
                className="w-16 h-16 object-cover rounded-lg border border-gray-100 hover:opacity-80 transition-opacity"
              />
            </button>
          ))}
        </div>
      )}
      <button
        onClick={handleHelpful}
        className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${
          voted ? 'text-brand-500 font-medium' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <ThumbsUp size={13} className={voted ? 'fill-brand-500' : ''} />
        Helpful ({helpfulCount})
      </button>

      {viewerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setViewerOpen(false)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setViewerOpen(false)}
              className="absolute -top-3 -right-3 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X size={16} className="text-gray-600" />
            </button>
            <img src={viewerImage} alt="Review" className="w-full rounded-xl max-h-[80vh] object-contain bg-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
