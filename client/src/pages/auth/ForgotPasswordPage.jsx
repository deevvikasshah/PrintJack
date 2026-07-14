import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email address');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setIsSent(true);
    } catch {
      // error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password | PrintJack</title>
      </Helmet>
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#E63946] to-[#c62d38] bg-clip-text text-transparent">
                PrintJack
              </span>
            </Link>
            <h2 className="text-2xl font-bold text-[#1D3557]">Forgot your password?</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {isSent ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#1D3557] mb-2">Check your email</h3>
              <p className="text-sm text-gray-500 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E63946] text-white font-medium rounded-xl hover:bg-[#c62d38] transition-colors"
              >
                <ArrowLeft size={18} />
                Back to Login
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-all ${
                        error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                      }`}
                      autoFocus
                    />
                  </div>
                  {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#E63946] text-white font-medium rounded-xl hover:bg-[#c62d38] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E63946] transition-colors">
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
