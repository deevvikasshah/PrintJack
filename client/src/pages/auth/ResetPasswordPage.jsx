import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
    } catch {
      // error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | PrintJack</title>
      </Helmet>
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#E63946] to-[#c62d38] bg-clip-text text-transparent">
                PrintJack
              </span>
            </Link>
            <h2 className="text-2xl font-bold text-[#1D3557]">Set new password</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Enter your new password below.
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#1D3557] mb-2">Password Reset Successful!</h3>
              <p className="text-sm text-gray-500 mb-6">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E63946] text-white font-medium rounded-xl hover:bg-[#c62d38] transition-colors"
              >
                Sign In
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                      placeholder="Enter new password"
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-all ${
                        errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                      placeholder="Re-enter new password"
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-all ${
                        errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
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
                      Reset Password
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-[#E63946] hover:underline font-medium">
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
