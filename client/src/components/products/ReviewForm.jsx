import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewForm({ isOpen, onClose, onSubmit, productName }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (rating === 0) errs.rating = 'Please select a rating';
    if (!name.trim()) errs.name = 'Name is required';
    if (!comment.trim()) errs.comment = 'Please write a review';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({ rating, title, comment, name });
      setRating(0);
      setTitle('');
      setComment('');
      setName('');
      onClose();
    } catch {
      setErrors({ submit: 'Failed to submit review. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Write a Review</h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {productName && (
                <p className="text-sm text-gray-500">
                  Reviewing: <span className="font-medium text-gray-900">{productName}</span>
                </p>
              )}

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Rating *
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={
                          star <= (hoveredRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200 fill-gray-200'
                        }
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && <p className="text-xs text-brand-500 mt-1">{errors.rating}</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
                {errors.name && <p className="text-xs text-brand-500 mt-1">{errors.name}</p>}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Review Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Review *</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Tell others about your experience with this product..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors resize-none"
                />
                {errors.comment && <p className="text-xs text-brand-500 mt-1">{errors.comment}</p>}
              </div>

              {errors.submit && (
                <p className="text-sm text-brand-500 bg-brand-500/10 px-4 py-2 rounded-lg">{errors.submit}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
