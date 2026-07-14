import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, TrendingUp, Folder } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import Newsletter from '../marketing/Newsletter';

export default function BlogSidebar({ categories = [], popularPosts = [], tags = [] }) {
  return (
    <aside className="space-y-8">
      <Newsletter variant="sidebar" />

      {categories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-[#1D3557] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Folder size={16} className="text-[#E63946]" />
            Categories
          </h3>
          <ul className="space-y-1">
            {categories.map((cat, i) => (
              <li key={i}>
                <Link
                  to={`/blog?category=${cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-600 hover:text-[#E63946] hover:bg-red-50 rounded-lg transition-colors"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {cat.count || 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {popularPosts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-[#1D3557] uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#E63946]" />
            Popular Posts
          </h3>
          <ul className="space-y-4">
            {popularPosts.map((post, i) => (
              <li key={i}>
                <Link to={`/blog/${post.slug}`} className="group flex gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={post.featuredImage || post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#E63946] transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(post.publishedAt || post.createdAt)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-[#1D3557] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Tag size={16} className="text-[#E63946]" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <Link
                key={i}
                to={`/blog?tag=${tag.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-[#E63946] hover:text-white rounded-full transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
