import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Package, PenTool, MapPin, Heart, Star, Users, User, Settings, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';

const navItems = [
  { to: '/dashboard/orders', label: 'My Orders', icon: Package },
  { to: '/dashboard/designs', label: 'My Designs', icon: PenTool },
  { to: '/dashboard/addresses', label: 'Address Book', icon: MapPin },
  { to: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/dashboard/loyalty', label: 'Loyalty Points', icon: Award },
  { to: '/dashboard/referrals', label: 'Referrals', icon: Users },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 flex-shrink-0`}>
      {/* User Info */}
      <div className="p-4 border-b border-gray-100">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-[#E63946] to-[#1D3557] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">{getInitials(user?.name)}</span>
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm text-[#1D3557] truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-red-50 text-[#E63946]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#1D3557]'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Loyalty Points */}
      {!collapsed && (
        <NavLink
          to="/dashboard/loyalty"
          className="mx-3 mb-3 p-4 bg-gradient-to-br from-[#1D3557] to-[#2a4a7a] rounded-xl block hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-2 mb-2">
            <Award size={18} className="text-yellow-400" />
            <span className="text-sm font-semibold text-white">Loyalty Points</span>
          </div>
          <p className="text-2xl font-bold text-white">{user?.loyaltyPoints || 0}</p>
          <p className="text-xs text-gray-300 mt-1">Earn points on every order</p>
        </NavLink>
      )}

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-gray-100 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-[#1D3557] hover:bg-gray-50 rounded-xl transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Collapse</span></>}
        </button>
      </div>
    </div>
  );
}
