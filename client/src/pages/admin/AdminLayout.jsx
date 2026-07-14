import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Bell, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { getInitials } from '../../utils/formatters';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, text: 'New order #PJ-1234 received', time: '2 min ago', read: false },
    { id: 2, text: 'Design approval pending for Order #PJ-1230', time: '15 min ago', read: false },
    { id: 3, text: 'Payment failed for Order #PJ-1228', time: '1 hour ago', read: true },
    { id: 4, text: 'New user registered: Rahul Sharma', time: '2 hours ago', read: true },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | PrintJack</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <AdminSidebar />
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block fixed inset-y-0 left-0 z-30">
          <AdminSidebar />
        </div>

        {/* Main content area */}
        <div className="lg:pl-64 min-h-screen flex flex-col">
          {/* Admin Header Bar */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              {/* Left side: hamburger + search */}
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-gray-500 hover:text-[#1D3557] hover:bg-gray-100 rounded-xl lg:hidden transition-colors"
                >
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <div className="relative max-w-md w-full hidden sm:block">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders, products, users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-colors"
                  />
                </div>
              </div>

              {/* Right side: notifications + admin name */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfileMenu(false);
                    }}
                    className="relative p-2 text-gray-500 hover:text-[#1D3557] hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#E63946] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-[#1D3557] text-sm">Notifications</h3>
                        <button className="text-xs text-[#E63946] hover:underline">Mark all read</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !n.read ? 'bg-red-50/50' : ''
                            }`}
                          >
                            <p className={`text-sm ${!n.read ? 'font-medium text-[#1D3557]' : 'text-gray-600'}`}>
                              {n.text}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2 border-t border-gray-100">
                        <button className="w-full text-center text-sm text-[#E63946] hover:underline font-medium">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin profile */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-[#E63946]"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-[#E63946] to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{getInitials(user?.name)}</span>
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium text-[#1D3557]">
                      {user?.name}
                    </span>
                    <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-[#1D3557]">{user?.name}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 text-left"
                        >
                          My Profile
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                          }}
                          className="w-full px-4 py-2 text-sm text-[#E63946] hover:bg-red-50 text-left"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>

        {/* Close dropdowns on outside click */}
        {(showNotifications || showProfileMenu) && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
          />
        )}
      </div>
    </>
  );
}
