import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, LogOut, Settings, Package, Heart, LayoutDashboard, Shield, PenTool, MapPin, Star, Users, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useDebounce } from '../../hooks/useDebounce';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { getInitials } from '../../utils/formatters';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 400);
  const userMenuRef = useClickOutside(() => setIsUserMenuOpen(false));
  const categoryRef = useClickOutside(() => setIsCategoryOpen(false), isCategoryOpen);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

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
            ? 'bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-100'
            : 'bg-white shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-1">
              <div className="w-8 h-8 bg-gradient-to-br from-[#E63946] to-[#c62d38] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#E63946] to-[#c62d38] bg-clip-text text-transparent">
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
                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    {searchCategory === 'all' ? 'All' : PRODUCT_CATEGORIES.find((c) => c.slug === searchCategory)?.name || 'All'}
                    <ChevronDown size={14} />
                  </button>
                  {isCategoryOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <button
                        type="button"
                        onClick={() => { setSearchCategory('all'); setIsCategoryOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          searchCategory === 'all' ? 'text-[#E63946] font-medium' : 'text-gray-700'
                        }`}
                      >
                        All Categories
                      </button>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => { setSearchCategory(cat.slug); setIsCategoryOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            searchCategory === cat.slug ? 'text-[#E63946] font-medium' : 'text-gray-700'
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
                  className="flex-1 px-4 py-2 border border-gray-200 focus:border-[#E63946] focus:ring-0 focus:outline-none text-sm bg-gray-50 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E63946] text-white rounded-r-xl hover:bg-[#c62d38] transition-colors"
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
                className="md:hidden p-2 text-gray-600 hover:text-[#E63946] transition-colors"
              >
                <Search size={22} />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-[#E63946] transition-colors"
              >
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E63946] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-[#E63946] to-[#1D3557] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{getInitials(user?.name)}</span>
                      </div>
                    )}
                    <ChevronDown size={14} className="hidden sm:block text-gray-500" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-[#1D3557] truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        {dashboardLinks.map((link) => (
                          <Link
                            key={link.to}
                            to={link.to}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#E63946] transition-colors"
                          >
                            <link.icon size={16} />
                            {link.label}
                          </Link>
                        ))}
                        <Link
                          to="/dashboard/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#E63946] transition-colors"
                        >
                          <Settings size={16} />
                          Settings
                        </Link>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="border-t border-gray-100 py-1">
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E63946] hover:bg-red-50 font-medium transition-colors"
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
                    className="px-4 py-2 text-sm font-medium text-[#1D3557] hover:text-[#E63946] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium bg-[#E63946] text-white rounded-xl hover:bg-[#c62d38] transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-[#E63946] transition-colors"
              >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Category Bar */}
        <div className="hidden lg:block border-t border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-hide">
              {PRODUCT_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-[#E63946] hover:bg-red-50 rounded-lg whitespace-nowrap transition-all"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold bg-gradient-to-r from-[#E63946] to-[#c62d38] bg-clip-text text-transparent">
                  PrintJack
                </span>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 text-gray-500">
                  <X size={20} />
                </button>
              </div>
              {!isAuthenticated && (
                <div className="mt-4 flex gap-2">
                  <Link to="/login" onClick={() => setIsMobileOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-[#1D3557] border border-[#1D3557] rounded-xl text-center hover:bg-gray-50 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#E63946] text-white rounded-xl text-center hover:bg-[#c62d38] transition-colors">
                    Register
                  </Link>
                </div>
              )}
              {isAuthenticated && (
                <div className="mt-4 flex items-center gap-3">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-[#E63946] to-[#1D3557] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{getInitials(user?.name)}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm text-[#1D3557]">{user?.name}</p>
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
              {PRODUCT_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#E63946] rounded-lg transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {isAuthenticated && (
              <div className="border-t border-gray-100 px-4 py-4">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dashboard</p>
                {dashboardLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#E63946] rounded-lg transition-colors"
                  >
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                ))}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#E63946] hover:bg-red-50 rounded-lg font-medium transition-colors"
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
