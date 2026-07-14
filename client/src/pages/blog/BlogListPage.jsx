import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Calendar, Clock, ArrowRight, TrendingUp, Filter, X } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import api from '../../utils/api';
import { formatDate, truncate } from '../../utils/formatters';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import BlogCard from '../../components/blog/BlogCard';
import BlogSidebar from '../../components/blog/BlogSidebar';
import SkeletonCard from '../../components/common/SkeletonCard';

const CATEGORIES = [
  { slug: 'all', name: 'All' },
  { slug: 'printing-tips', name: 'Printing Tips' },
  { slug: 'design', name: 'Design' },
  { slug: 'corporate-gifting', name: 'Corporate Gifting' },
  { slug: 'industry-news', name: 'Industry News' },
];

const TAGS = [
  'Business Cards', 'T-Shirts', 'Stickers', 'Branding', 'Logo Design',
  'Bulk Printing', 'Custom Mugs', 'Tote Bags', 'Posters', 'Flyers',
  'Design Tips', 'Typography', 'Color Theory', 'Corporate Gifts', 'Merchandise',
];

export default function BlogListPage() {
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { execute: fetchPosts, data, loading } = useApi(api.get);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams({ page, limit: 9 });
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (debouncedSearch) params.set('q', debouncedSearch);
    fetchPosts(`/blog?${params.toString()}`);
  }, [page, activeCategory, debouncedSearch, fetchPosts]);

  const posts = data?.posts || data?.data || [];
  const totalPages = data?.totalPages || data?.pages || 1;
  const totalPosts = data?.total || posts.length;
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const regularPosts = posts.length > 1 ? posts.slice(1) : [];

  const categoriesWithCount = CATEGORIES.map((cat) => ({
    ...cat,
    count: cat.slug === 'all' ? totalPosts : posts.filter((p) => p.category?.toLowerCase().replace(/\s+/g, '-') === cat.slug).length,
  }));

  const popularPosts = posts.slice(0, 4);

  const handleCategoryChange = (slug) => {
    setActiveCategory(slug);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Blog | PrintJack - Tips, Trends & Custom Printing Guide</title>
        <meta name="description" content="Design tips, product guides, printing techniques, and creative inspiration for your next project at PrintJack." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Blog' }]} />

        {/* Hero Section */}
        <div className="text-center mb-12">
          <span className="text-[#E63946] font-semibold text-sm uppercase tracking-wider">Our Blog</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] mt-2">
            Print Tales & Pro Tips
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-lg leading-relaxed">
            Expert printing guides, creative design inspiration, and insider tips to help you
            create standout products for your brand.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blog posts..."
              className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] transition-colors"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.slug
                  ? 'bg-[#E63946] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts Column */}
          <div className="lg:col-span-2">
            {loading && posts.length === 0 ? (
              <>
                <SkeletonCard imageHeight="h-64" className="mb-6" lines={4} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </>
            ) : posts.length === 0 ? (
              <EmptyState
                title={searchQuery ? 'No results found' : 'No blog posts yet'}
                description={searchQuery ? `No posts match "${searchQuery}". Try different keywords.` : "We're working on great content. Check back soon!"}
              />
            ) : (
              <>
                {/* Featured Post */}
                {page === 1 && activeCategory === 'all' && !debouncedSearch && featuredPost && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp size={16} className="text-[#E63946]" />
                      <span className="text-sm font-semibold text-[#E63946] uppercase tracking-wider">Featured</span>
                    </div>
                    <BlogCard post={featuredPost} featured />
                  </div>
                )}

                {/* Regular Posts Grid */}
                {(page === 1 && activeCategory === 'all' && !debouncedSearch ? regularPosts : posts).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(page === 1 && activeCategory === 'all' && !debouncedSearch ? regularPosts : posts).map((post) => (
                      <BlogCard key={post._id || post.slug} post={post} />
                    ))}
                  </div>
                )}

                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar
              categories={categoriesWithCount}
              popularPosts={popularPosts}
              tags={TAGS}
            />
          </div>
        </div>
      </div>
    </>
  );
}
