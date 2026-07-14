import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('printjack_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user && !!token;

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('printjack_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('printjack_token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/register', { name, email, password, phone });
      localStorage.setItem('printjack_token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success('Account created successfully!');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('printjack_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const googleLogin = async (idToken) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/google', { idToken });
      localStorage.setItem('printjack_token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome, ${data.user.name}!`);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Google login failed';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const sendOTP = async (emailOrPhone) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/send-otp', { emailOrPhone });
      toast.success('OTP sent successfully');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send OTP';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const verifyOTP = async (code, emailOrPhone) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/verify-otp', { code, emailOrPhone });
      if (data.token) {
        localStorage.setItem('printjack_token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
      toast.success('OTP verified successfully');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'OTP verification failed';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success('Password reset link sent to your email');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset link';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setError(null);
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful! Please login.');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset failed';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const { data } = await api.put('/auth/profile', profileData);
      setUser(data.user);
      toast.success('Profile updated successfully');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    googleLogin,
    sendOTP,
    verifyOTP,
    forgotPassword,
    resetPassword,
    updateProfile,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
