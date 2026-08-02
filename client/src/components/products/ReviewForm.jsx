import { useState, useRef } from 'react';
import { Star, X, Loader2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewForm({ isOpen, onClose, onSubmit, productName }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [readingPhotos, setReadingPhotos] = useState(false);
  const fileInputRef = useRef(null);

  const validate = () => {
    const errs = {};
    if (rating === 0) errs.rating = 'Please select a rating';
    if (!comment.trim()) errs.comment = 'Please write a review';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    setReadingPhotos(true);
    const fileList = Array.from(files).slice(0, 3);
    const total = photos.length;
    const nextPhotos = [...photos];
    let done = 0;
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (total + fileList.length <= 3) {
          nextPhotos.push(e.target.result);
        }
        done += 1;
        if (done === fileList.length) {
          setPhotos(nextPhotos.slice(0, 3));
          setReadingPhotos(false);
        }
      };
      reader.onerror = () => {
        done += 1;
        if (done === fileList.length) {
          setReadingPhotos(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({ rating, title, comment, photos });
      setRating(0);
      setTitle('');
      setComment('');
      setPhotos([]);
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
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
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

              {/* Photos */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Add Photos (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="flex gap-2 flex-wrap">
                  {photos.map((p, i) => (
                    <div key={i} className="relative">
                      <img src={p} alt="Upload preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {photos.length < 3 && (
                    <button
                      type="button"
                      disabled={readingPhotos}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-brand-500 hover:text-brand-500 transition-colors disabled:opacity-50"
                    >
                      {readingPhotos ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                      <span className="text-[9px] mt-0.5">Add</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">You can add up to 3 photos.</p>
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
