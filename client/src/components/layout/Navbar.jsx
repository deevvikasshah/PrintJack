import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, User, Menu, X, ChevronDown, LogOut, Settings,
  Package, Heart, LayoutDashboard, Shield, PenTool, MapPin, Star, Users, FileText,
  ArrowRight, Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCartFly } from '../../context/CartFlyContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useDebounce } from '../../hooks/useDebounce';
import { PRODUCT_CATEGORIES, MEGA_MENU_FALLBACK } from '../../utils/constants';
import { getInitials } from '../../utils/formatters';
import api from '../../utils/api';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { registerCart } = useCartFly();
  const navigate = useNavigate();
  const location = useLocation();
  const cartIconRef = useRef(null);

  useEffect(() => {
    if (cartIconRef.current) registerCart(cartIconRef.current);
  }, [registerCart, isAuthenticated]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [megaTree, setMegaTree] = useState(null);
  const [activeMega, setActiveMega] = useState(null);
  const [openMobileCat, setOpenMobileCat] = useState(null);
  const megaNavRef = useRef(null);
  const hideTimerRef = useRef(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const startHideTimer = () => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => setActiveMega(null), 150);
  };

  useEffect(() => () => clearHideTimer(), []);

  const debouncedSearch = useDebounce(searchQuery, 400);
  const userMenuRef = useClickOutside(() => setIsUserMenuOpen(false));
  const categoryRef = useClickOutside(() => setIsCategoryOpen(false), isCategoryOpen);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/categories')
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setMegaTree(data.categories);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (megaNavRef.current && !megaNavRef.current.contains(e.target)) {
        setActiveMega(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
    setActiveMega(null);
    setOpenMobileCat(null);
  }, [location]);

  const isApiMenu = Array.isArray(megaTree) && megaTree.length > 0;

  const menuCategories = (isApiMenu ? megaTree : MEGA_MENU_FALLBACK).map((cat) => ({
    name: cat.name,
    slug: cat.slug || null,
    image: cat.image || '',
    children: (cat.children || cat.subcategories || []).map((sub) => ({
      name: sub.name,
      slug: sub.slug || null,
    })),
  }));

  const categoryHref = (cat) => (cat.slug ? `/products?category=${cat.slug}` : '/products');

  const subcategoryHref = (sub, parent) => {
    if (!isApiMenu && sub.slug) return `/products?category=${sub.slug}`;
    return categoryHref(parent);
  };

  const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const megaColumns = (cat) => chunk(cat.children, 5);

  useEffect(() => {
    if (debouncedSearch) {
      const params = new URLSearchParams();
      params.set('q', debouncedSearch);
      if (searchCategory !== 'all') params.set('category', searchCategory);
      navigate(`/products?${params.toString()}`);
    }
  }, [debouncedSearch, searchCategory, navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      if (searchCategory !== 'all') params.set('category', searchCategory);
      navigate(`/products?${params.toString()}`);
      setIsSearchFocused(false);
    }
  };

  const dashboardLinks = [
    { to: '/dashboard/orders', label: 'My Orders', icon: Package },
    { to: '/dashboard/designs', label: 'My Designs', icon: PenTool },
    { to: '/dashboard/addresses', label: 'Addresses', icon: MapPin },
    { to: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-paper-50/90 backdrop-blur-lg shadow-sm border-b border-ink/10'
            : 'bg-paper-50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm font-display">P</span>
              </div>
              <span className="font-display text-xl font-semibold text-ink">
                PrintJack
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={categoryRef}>
              <form onSubmit={handleSearchSubmit} className="w-full flex">
                <div className="relative flex">
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="flex items-center gap-1 px-3 py-2 bg-paper-100 border border-r-0 border-ink/15 rounded-l-full text-sm text-ink/70 hover:bg-paper-200 transition-colors whitespace-nowrap"
                  >
                    {searchCategory === 'all' ? 'All' : PRODUCT_CATEGORIES.find((c) => c.slug === searchCategory)?.name || 'All'}
                    <ChevronDown size={14} />
                  </button>
                  {isCategoryOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-paper-50 rounded-xl shadow-xl border border-ink/10 py-2 z-50">
                      <button
                        type="button"
                        onClick={() => { setSearchCategory('all'); setIsCategoryOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-paper-100 transition-colors ${
                          searchCategory === 'all' ? 'text-pj-green font-medium' : 'text-ink/80'
                        }`}
                      >
                        All Categories
                      </button>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => { setSearchCategory(cat.slug); setIsCategoryOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-paper-100 transition-colors ${
                            searchCategory === cat.slug ? 'text-pj-green font-medium' : 'text-ink/80'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search products, categories..."
                  className="flex-1 px-4 py-2 border border-ink/15 focus:border-pj-green focus:ring-0 focus:outline-none text-sm bg-paper-50 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-ink text-paper-50 rounded-r-full hover:bg-pj-green transition-colors"
                >
                  <Search size={18} />
                </button>
              </form>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search */}
              <Link
                to="/products"
                className="md:hidden p-2 text-gray-600 hover:text-pj-green transition-colors"
              >
                <Search size={22} />
              </Link>

              {/* Cart */}
              <Link
                ref={cartIconRef}
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-pj-green transition-colors"
              >
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-ink text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-paper-100 transition-colors"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-ink to-pj-green rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{getInitials(user?.name)}</span>
                      </div>
                    )}
                    <ChevronDown size={14} className="hidden sm:block text-gray-500" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-paper-50 rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        {dashboardLinks.map((link) => (
                          <Link
                            key={link.to}
                            to={link.to}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-pj-green transition-colors"
                          >
                            <link.icon size={16} />
                            {link.label}
                          </Link>
                        ))}
                        <Link
                          to="/dashboard/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-pj-green transition-colors"
                        >
                          <Settings size={16} />
                          Settings
                        </Link>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="border-t border-gray-100 py-1">
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-pj-green hover:bg-paper-100 font-medium transition-colors"
                          >
                            <Shield size={16} />
                            Admin Dashboard
                          </Link>
                        </div>
                      )}
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={logout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-ink hover:text-pj-green transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium bg-ink text-white rounded-xl hover:bg-pj-green transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-pj-green transition-colors"
              >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Category Bar + Mega Menu */}
        <div
          ref={megaNavRef}
          className="hidden lg:block border-t border-gray-100 bg-paper-50/80 backdrop-blur-sm"
          onMouseLeave={startHideTimer}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-hide">
              {menuCategories.map((cat) => {
                const isActive = activeMega === cat.name;
                return (
                  <Link
                    key={cat.name}
                    to={categoryHref(cat)}
                    onMouseEnter={() => {
                      clearHideTimer();
                      if (cat.children.length > 0) setActiveMega(cat.name);
                    }}
                    onClick={() => setActiveMega(isActive ? null : cat.name)}
                    aria-expanded={isActive}
                    aria-haspopup="true"
                    className={`relative inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                      isActive
                        ? 'text-pj-green bg-paper-100'
                        : 'text-gray-600 hover:text-pj-green hover:bg-paper-100'
                    }`}
                  >
                    {cat.name}
                    {cat.children.length > 0 && (
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mega Menu Panel */}
          <AnimatePresence>
            {activeMega && (() => {
              const cat = menuCategories.find((c) => c.name === activeMega);
              if (!cat) return null;
              const columns = megaColumns(cat);
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  onMouseEnter={clearHideTimer}
                  onMouseLeave={startHideTimer}
                  className="absolute left-0 right-0 top-full z-50"
                >
                  <div className="max-w-7xl mx-auto mt-1 px-4 sm:px-6 lg:px-8">
                    <div className="bg-paper-50/95 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-2xl overflow-hidden">
                      <div className="flex">
                        {/* Sub-category columns */}
                        <div className="flex-1 p-7">
                          {cat.children.length > 0 ? (
                            <div className="flex flex-wrap gap-x-10 gap-y-6">
                              {columns.map((col, i) => (
                                <ul key={i} className="space-y-2.5 min-w-0 w-44">
                                  {col.map((sub) => (
                                    <li key={sub.name}>
                                      <Link
                                        to={subcategoryHref(sub, cat)}
                                        onClick={() => setActiveMega(null)}
                                        className="text-sm text-ink/70 hover:text-pj-green transition-colors inline-flex items-start gap-1.5 group"
                                      >
                                        <span className="mt-[7px] w-1 h-1 rounded-full bg-ink/20 group-hover:bg-pj-green transition-colors flex-shrink-0" />
                                        <span>{sub.name}</span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-ink/50">
                              Browse all {cat.name} products below.
                            </p>
                          )}
                        </div>

                        {/* Promo / view-all card */}
                        <Link
                          to={categoryHref(cat)}
                          onClick={() => setActiveMega(null)}
                          className="hidden sm:flex flex-col justify-between w-64 shrink-0 m-4 ml-0 bg-gradient-to-br from-ink to-pj-green rounded-xl p-6 text-paper-50 group"
                        >
                          <div>
                            <p className="text-xs uppercase tracking-widest text-paper-50/70 mb-2">
                              <Layers size={14} className="inline mr-1.5 -mt-0.5" />
                              Shop
                            </p>
                            <p className="font-display text-2xl font-semibold leading-tight mb-2">
                              {cat.name}
                            </p>
                            <p className="text-sm text-paper-50/80">
                              Browse the full {cat.name.toLowerCase()} collection with premium finishes.
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold mt-6">
                            View all
                            <ArrowRight
                              size={14}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-paper-50 shadow-2xl z-50 overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold text-ink">
                  PrintJack
                </span>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 text-gray-500">
                  <X size={20} />
                </button>
              </div>
              {!isAuthenticated && (
                <div className="mt-4 flex gap-2">
                  <Link to="/login" onClick={() => setIsMobileOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-ink border border-ink rounded-xl text-center hover:bg-gray-50 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-ink text-white rounded-xl text-center hover:bg-pj-green transition-colors">
                    Register
                  </Link>
                </div>
              )}
              {isAuthenticated && (
                <div className="mt-4 flex items-center gap-3">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-ink to-pj-green rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{getInitials(user?.name)}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm text-ink">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <Link to="/products" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Search size={18} /> All Products
              </Link>
            </div>

            <div className="px-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
              {menuCategories.map((cat) => {
                const isOpen = openMobileCat === cat.name;
                const hasChildren = cat.children.length > 0;
                return (
                  <div key={cat.name} className="rounded-xl overflow-hidden">
                    <div className="flex items-center">
                      <Link
                        to={categoryHref(cat)}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex-1 flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-pj-green transition-colors"
                      >
                        {cat.name}
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => setOpenMobileCat(isOpen ? null : cat.name)}
                          aria-expanded={isOpen}
                          className="p-3 text-gray-400 hover:text-pj-green transition-colors"
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {isOpen && hasChildren && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <ul className="ml-4 pl-3 border-l border-gray-100 py-1">
                            {cat.children.map((sub) => (
                              <li key={sub.name}>
                                <Link
                                  to={subcategoryHref(sub, cat)}
                                  onClick={() => setIsMobileOpen(false)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-pj-green hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <span className="w-1 h-1 rounded-full bg-ink/20" />
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {isAuthenticated && (
              <div className="border-t border-gray-100 px-4 py-4">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dashboard</p>
                {dashboardLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-pj-green rounded-lg transition-colors"
                  >
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                ))}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-pj-green hover:bg-paper-100 rounded-lg font-medium transition-colors"
                  >
                    <Shield size={16} />
                    Admin Dashboard
                  </Link>
                )}
              </div>
            )}

            <div className="border-t border-gray-100 p-4">
              <Link to="/blog" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText size={16} /> Blog
              </Link>
              <Link to="/about" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                About Us
              </Link>
              <Link to="/contact" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Contact
              </Link>
              {isAuthenticated && (
                <button
                  onClick={() => { logout(); setIsMobileOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className={`h-16 lg:h-[72px] ${isScrolled ? '' : ''}`} />
      <div className="hidden lg:block h-10" />
    </>
  );
}
