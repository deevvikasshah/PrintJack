import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import Loading from './components/common/Loading';
import WhatsAppButton from './components/marketing/WhatsAppButton';
import BackToTop from './components/common/BackToTop';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/products/ProductDetailPage'));
const EditorPage = lazy(() => import('./pages/editor/EditorPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const OrdersPage = lazy(() => import('./pages/dashboard/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/dashboard/OrderDetailPage'));
const DesignsPage = lazy(() => import('./pages/dashboard/DesignsPage'));
const AddressesPage = lazy(() => import('./pages/dashboard/AddressesPage'));
const WishlistPage = lazy(() => import('./pages/dashboard/WishlistPage'));
const LoyaltyPage = lazy(() => import('./pages/dashboard/LoyaltyPage'));
const ReferralsPage = lazy(() => import('./pages/dashboard/ReferralsPage'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const BlogListPage = lazy(() => import('./pages/blog/BlogListPage'));
const BlogDetailPage = lazy(() => import('./pages/blog/BlogDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <ScrollToTop />
      <Routes>
        {/* Public routes with Navbar & Footer */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
        <Route path="/products/:slug" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
        <Route path="/editor/:productId" element={<PublicLayout><EditorPage /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><BlogListPage /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogDetailPage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
        <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
        <Route path="/track-order" element={<PublicLayout><TrackOrderPage /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />

        {/* Auth routes */}
        <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
        <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
        <Route path="/reset-password/:token" element={<PublicLayout><ResetPasswordPage /></PublicLayout>} />

        {/* Protected checkout */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <PublicLayout><CheckoutPage /></PublicLayout>
            </ProtectedRoute>
          }
        />

        {/* Dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="designs" element={<DesignsPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="loyalty" element={<LoyaltyPage />} />
          <Route path="referrals" element={<ReferralsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
      </Routes>
      <WhatsAppButton />
      <BackToTop />
    </Suspense>
  );
}
