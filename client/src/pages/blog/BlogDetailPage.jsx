import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, User, ArrowLeft, Eye, Tag, BookOpen } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import api from '../../utils/api';
import { formatDateLong, formatDate } from '../../utils/formatters';
import Breadcrumb from '../../components/common/Breadcrumb';
import Loading from '../../components/common/Loading';
import ShareButtons from '../../components/blog/ShareButtons';
import TableOfContents from '../../components/blog/TableOfContents';
import AuthorCard from '../../components/blog/AuthorCard';
import CommentSection from '../../components/blog/CommentSection';
import BlogCard from '../../components/blog/BlogCard';
import Newsletter from '../../components/marketing/Newsletter';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const { execute: fetchPost, data: post, loading } = useApi(api.get);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    fetchPost(`/blog/${slug}`);
  }, [slug, fetchPost]);

  useEffect(() => {
    if (post?.category) {
      api.get(`/blog?category=${post.category}&limit=4`)
        .then(({ data }) => {
          const related = (data?.posts || data?.data || []).filter(
            (p) => p.slug !== slug
          ).slice(0, 3);
          setRelatedPosts(related);
        })
        .catch(() => {});
    }
  }, [post, slug]);

  if (loading) return <Loading />;
  if (!post) return null;

  return (
    <>
      <Helmet>
        <title>{post.title} | PrintJack Blog</title>
        <meta name="description" content={post.excerpt || post.title} />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.title} />
      </Helmet>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ to: '/blog', label: 'Blog' }, { label: post.title }]} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <article>
              {/* Post Meta */}
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-4 flex-wrap">
                {post.category && (
                  <Link
                    to={`/blog?category=${post.category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-3 py-1 bg-red-50 text-[#E63946] rounded-full font-medium text-xs hover:bg-red-100 transition-colors"
                  >
                    {post.category}
                  </Link>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDateLong(post.publishedAt || post.createdAt)}
                </span>
                {post.readTime && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {post.readTime} min read
                  </span>
                )}
                {post.views != null && (
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {post.views.toLocaleString()} views
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] leading-tight mb-6">
                {post.title}
              </h1>

              {/* Author & Share Row */}
              <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-gray-200">
                {post.author && (
                  <div className="flex items-center gap-3">
                    {post.author.avatar ? (
                      <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-[#E63946] to-[#1D3557] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {post.author.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[#1D3557]">{post.author.name}</p>
                      {post.author.role && <p className="text-xs text-gray-500">{post.author.role}</p>}
                    </div>
                  </div>
                )}
                <ShareButtons title={post.title} />
              </div>

              {/* Content */}
              <div
                className="prose prose-lg prose-headings:text-[#1D3557] prose-a:text-[#E63946] prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg max-w-none mb-10"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-8 pt-6 border-t border-gray-200">
                  <Tag size={16} className="text-gray-400" />
                  {post.tags.map((tag, i) => (
                    <Link
                      key={i}
                      to={`/blog?tag=${tag.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-[#E63946] hover:text-white rounded-full transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Author Bio */}
              {post.author && <AuthorCard author={post.author} className="mb-10" />}

              {/* Comments */}
              <div className="mb-10">
                <CommentSection
                  postId={post._id}
                  comments={post.comments || []}
                  onCommentAdded={() => fetchPost(`/blog/${slug}`)}
                />
              </div>
            </article>
          </div>

          {/* Right Sidebar (Desktop) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Sticky sidebar */}
            <div className="lg:sticky lg:top-24 space-y-8">
              {/* Table of Contents */}
              <TableOfContents content={post.content} />

              {/* Share Buttons - Desktop */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 hidden lg:block">
                <h3 className="text-sm font-bold text-[#1D3557] uppercase tracking-wider mb-4">Share this post</h3>
                <ShareButtons title={post.title} />
              </div>

              {/* Newsletter */}
              <Newsletter variant="sidebar" />
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-8">
              <BookOpen size={20} className="text-[#E63946]" />
              <h2 className="text-2xl font-bold text-[#1D3557]">Related Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <BlogCard key={rp._id || rp.slug} post={rp} />
              ))}
            </div>
          </section>
        )}

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#E63946] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to All Posts
          </Link>
        </div>

        {/* Bottom Newsletter CTA */}
        <div className="mt-16">
          <Newsletter />
        </div>
      </div>
    </>
  );
}
