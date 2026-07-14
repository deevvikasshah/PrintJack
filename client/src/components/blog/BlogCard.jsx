import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { formatDate, truncate } from '../../utils/formatters';

export default function BlogCard({ post, featured = false, className = '' }) {
  if (featured) {
    return (
      <Link
        to={`/blog/${post.slug}`}
        className={`group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
      >
        <div className="grid md:grid-cols-2 gap-0">
          <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
            <img
              src={post.featuredImage || post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
              {post.category && (
                <span className="px-2.5 py-1 bg-red-50 text-[#E63946] rounded-md font-medium">{post.category}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(post.publishedAt || post.createdAt)}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1D3557] mb-3 group-hover:text-[#E63946] transition-colors leading-tight">
              {post.title}
            </h2>
            <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">
              {truncate(post.excerpt || post.content, 200)}
            </p>
            <div className="flex items-center justify-between">
              {post.author && (
                <div className="flex items-center gap-2">
                  {post.author.avatar ? (
                    <img src={post.author.avatar} alt={post.author.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 bg-gradient-to-br from-[#E63946] to-[#1D3557] rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">{post.author.name?.[0]}</span>
                    </div>
                  )}
                  <span className="text-xs text-gray-500">{post.author.name}</span>
                </div>
              )}
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#E63946] group-hover:gap-2 transition-all">
                Read More <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={post.featuredImage || post.image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          {post.category && (
            <span className="px-2 py-1 bg-red-50 text-[#E63946] rounded-md font-medium">{post.category}</span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          {post.readTime && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {post.readTime} min read
            </span>
          )}
        </div>
        <h2 className="text-lg font-bold text-[#1D3557] mb-2 group-hover:text-[#E63946] transition-colors line-clamp-2 leading-snug">
          {post.title}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {truncate(post.excerpt || post.content, 120)}
        </p>
        <div className="flex items-center justify-between">
          {post.author && (
            <div className="flex items-center gap-2">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-br from-[#E63946] to-[#1D3557] rounded-full flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">{post.author.name?.[0]}</span>
                </div>
              )}
              <span className="text-xs text-gray-500">{post.author.name}</span>
            </div>
          )}
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#E63946] group-hover:gap-2 transition-all">
            Read More <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
