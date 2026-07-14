import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, FolderTree, PenTool, Ticket, FileText, Users, Settings, BarChart3, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { getInitials } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/products', label: 'Products', icon: Tag },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/designs', label: 'Design Approvals', icon: PenTool },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/blog', label: 'Blog', icon: FileText },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-[#1D3557] rounded-2xl shadow-sm overflow-hidden transition-all duration-300 flex-shrink-0`}>
      {/* Admin Badge */}
      <div className="p-4 border-b border-white/10">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-[#E63946]" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-[#E63946] to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{getInitials(user?.name)}</span>
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white truncate">{user?.name}</p>
              <div className="flex items-center gap-1">
                <Shield size={10} className="text-[#E63946]" />
                <span className="text-[10px] font-semibold text-[#E63946] uppercase">Admin</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-0.5">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#E63946] text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Back to Store */}
      {!collapsed && (
        <div className="mx-3 mb-3">
          <NavLink
            to="/"
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm text-gray-300 border border-white/20 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
          >
            Back to Store
          </NavLink>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-white/10 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Collapse</span></>}
        </button>
      </div>
    </div>
  );
}
