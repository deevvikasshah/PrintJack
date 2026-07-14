import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Menu, X, ChevronRight } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Dashboard | PrintJack</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-[#1D3557] hover:bg-white rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-[#1D3557]">My Account</h1>
            <div className="w-10" />
          </div>

          {/* Welcome Banner - Desktop */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold text-[#1D3557]">
              Welcome back, <span className="text-[#E63946]">{user?.name?.split(' ')[0] || 'User'}</span>
            </h1>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                  <div className="h-full">
                    <Sidebar />
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 -right-10 p-2 text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
