import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { AuthModal } from '@/components/common/auth-modal';
import { CommandPalette } from '@/components/common/command-palette';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { ProtectedRoute } from '@/components/common/protected-route';
import { AuthProvider } from '@/hooks/use-auth';
import { ToastProvider } from '@/components/ui/toast';
import { useLenis } from '@/hooks/use-lenis';

// Pages
import { Home } from '@/pages/home';
import { Browse } from '@/pages/browse';
import { PromptDetail } from '@/pages/prompt-detail';
import { VaultList } from '@/pages/vault/vault-list';
import { PromptEditor } from '@/pages/vault/prompt-editor';
import { OrderSummary } from '@/pages/checkout/order-summary';
import { OrderReceipt } from '@/pages/checkout/order-receipt';
import { AdminDashboard } from '@/pages/admin/admin-dashboard';
import { SellerDashboard } from '@/pages/seller/seller-dashboard';
import { UserDashboard } from '@/pages/user/user-dashboard';
import { Terms } from '@/pages/legal/terms';
import { Privacy } from '@/pages/legal/privacy';
import { Refund } from '@/pages/legal/refund';
import { License } from '@/pages/legal/license';
import { NotFound } from '@/pages/not-found';

function AppContent(): React.ReactElement {
  // Initialize Lenis smooth scroll
  useLenis();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background text-text-ivory flex flex-col selection:bg-gold/30 selection:text-gold-light film-grain">
      {!isAdminRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/prompt/:slug" element={<PromptDetail />} />

          {/* Personal Vault Routes */}
          <Route
            path="/vault"
            element={
              <ProtectedRoute>
                <VaultList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vault/new"
            element={
              <ProtectedRoute>
                <PromptEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vault/edit/:id"
            element={
              <ProtectedRoute>
                <PromptEditor />
              </ProtectedRoute>
            }
          />

          {/* Checkout & Payments */}
          <Route
            path="/checkout/:promptId"
            element={
              <ProtectedRoute>
                <OrderSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/receipt/:orderId"
            element={
              <ProtectedRoute>
                <OrderReceipt />
              </ProtectedRoute>
            }
          />

          {/* User Control Panel */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Governance & Creator Dashboards */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Legal & Trust */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/license" element={<License />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
      <AuthModal />
      <CommandPalette />
    </div>
  );
}

export default function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
