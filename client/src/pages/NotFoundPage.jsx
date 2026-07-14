import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <>
      <Helmet><title>Page Not Found | PrintJack</title></Helmet>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-8xl font-bold bg-gradient-to-r from-[#E63946] to-[#c62d38] bg-clip-text text-transparent mb-4">
            404
          </div>
          <h1 className="text-2xl font-bold text-[#1D3557] mb-3">Page Not Found</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-[#E63946] text-white font-medium rounded-xl hover:bg-[#c62d38] transition-colors"
            >
              <Home size={18} />
              Go Home
            </Link>
            <Link
              to="/products"
              className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Search size={18} />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
