import { Star, ThumbsUp, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReviewCard({ review, index = 0 }) {
  const { rating, title, comment, name, date, helpful = 0, images = [] } = review;

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="py-5 border-b border-gray-100 last:border-0"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy-700/10 flex items-center justify-center">
            <User size={18} className="text-navy-700" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{name}</h4>
            <p className="text-xs text-gray-400">{formattedDate}</p>
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
      {images.length > 0 && (
        <div className="flex gap-2 mt-3">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="Review image"
              className="w-16 h-16 object-cover rounded-lg border border-gray-100"
            />
          ))}
        </div>
      )}
      <button className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
        <ThumbsUp size={13} />
        Helpful ({helpful})
      </button>
    </motion.div>
  );
}
