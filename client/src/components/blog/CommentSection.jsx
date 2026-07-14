import React, { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CommentSection({ postId, comments = [], onCommentAdded, className = '' }) {
  const { user, isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/blog/${postId}/comments`, { text: text.trim() });
      setText('');
      toast.success('Comment posted!');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-bold text-[#1D3557] flex items-center gap-2 mb-6">
        <MessageSquare size={20} />
        Comments ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          {isAuthenticated && user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isAuthenticated ? 'Write a comment...' : 'Please login to comment'}
              disabled={!isAuthenticated}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] resize-none transition-colors disabled:bg-gray-50 disabled:text-gray-400"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!text.trim() || !isAuthenticated || submitting}
                className="px-5 py-2 bg-[#E63946] text-white text-sm font-semibold rounded-xl hover:bg-[#c62d38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={14} />
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="space-y-6">
        {comments.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No comments yet. Be the first to share your thoughts!</p>
        )}
        {comments.map((comment) => (
          <div key={comment._id} className="flex gap-3">
            {comment.user?.avatar ? (
              <img src={comment.user.avatar} alt={comment.user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-[#E63946] to-[#1D3557] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {comment.user?.name?.[0] || '?'}
                </span>
              </div>
            )}
            <div className="flex-1 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-[#1D3557]">{comment.user?.name || 'Anonymous'}</span>
                <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
