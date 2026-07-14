import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Search, ShoppingCart, User, LogOut, Package, PenTool, MapPin, Heart, Shield, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { getInitials } from '../../utils/formatters';

export default function MobileNav({ isOpen, onClose }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  React.useEffect(() => {
    onClose();
  }, [location.pathname]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const dashboardLinks = [
    { to: '/dashboard/orders', label: 'My Orders', icon: Package },
    { to: '/dashboard/designs', label: 'My Designs', icon: PenTool },
    { to: '/dashboard/addresses', label: 'Addresses', icon: MapPin },
    { to: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold bg-gradient-to-r from-[#E63946] to-[#c62d38] bg-clip-text text-transparent">
              PrintJack
            </span>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          {isAuthenticated ? (
            <div className="mt-4 flex items-center gap-3">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-[#E63946] to-[#1D3557] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{getInitials(user?.name)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#1D3557] truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <Link to="/login" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-[#1D3557] border border-[#1D3557] rounded-xl text-center hover:bg-gray-50 transition-colors">
                Login
              </Link>
              <Link to="/register" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#E63946] text-white rounded-xl text-center hover:bg-[#c62d38] transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>

        <div className="p-4">
          <Link to="/products" onClick={onClose} className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="flex items-center gap-3"><Search size={18} /> All Products</span>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
          <Link to="/cart" onClick={onClose} className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="flex items-center gap-3">
              <ShoppingCart size={18} /> Cart
              {itemCount > 0 && (
                <span className="px-2 py-0.5 bg-[#E63946] text-white text-xs font-bold rounded-full">{itemCount}</span>
              )}
            </span>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        </div>

        <div className="px-4 pb-2">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
          {PRODUCT_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#E63946] rounded-lg transition-colors"
            >
              <span>{cat.name}</span>
              <ChevronRight size={14} className="text-gray-300" />
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
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#E63946] rounded-lg transition-colors"
              >
                <span className="flex items-center gap-3"><link.icon size={16} />{link.label}</span>
                <ChevronRight size={14} className="text-gray-300" />
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#E63946] hover:bg-red-50 rounded-lg font-medium transition-colors">
                <Shield size={16} /> Admin Dashboard
              </Link>
            )}
          </div>
        )}

        <div className="border-t border-gray-100 p-4">
          <Link to="/blog" onClick={onClose} className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="flex items-center gap-3"><FileText size={16} /> Blog</span>
            <ChevronRight size={14} className="text-gray-300" />
          </Link>
          <Link to="/about" onClick={onClose} className="flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            About Us
          </Link>
          <Link to="/contact" onClick={onClose} className="flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            Contact
          </Link>
          {isAuthenticated && (
            <button
              onClick={() => { logout(); onClose(); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
