/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar, Footer } from './components/Navigation';
import { Home } from './pages/Home';
import { PetDetail } from './pages/PetDetail';
import { ApplyForm } from './pages/ApplyForm';
import { Shop } from './pages/Shop';
import { Pets } from './pages/Pets';
import { Community } from './pages/Community';
import { Auth } from './pages/Auth';
import { AdminLogin } from './pages/AdminLogin';
import { StaffLogin } from './pages/StaffLogin';
import { Survey } from './pages/Survey';
import { AdminDashboard } from './pages/AdminDashboard';
import { AnimatePresence } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PaymentResult } from './pages/PaymentResult';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { ChangePassword } from './pages/ChangePassword';
import { AIChatBot } from './components/AIChatBot';
import { Profile } from './pages/Profile';
import { History } from './pages/History';

// Ping BE ngay khi app load để wake up Render free tier trước khi user action
fetch('/api/').catch(() => {});

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const location = useLocation();
  const noNavPaths = [
    '/admin', '/staff', '/login', '/register',
    '/payment/result', '/forgot-password', '/reset-password', '/change-password'
  ];
  const isAdminPath = noNavPaths.some(p => location.pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPath && <Navbar />}
      <ScrollToTop />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {/* @ts-ignore */}
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/pet/:id" element={<PetDetail />} />
            <Route path="/apply/:id" element={<ApplyForm />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/community" element={<Community />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/payment/result"   element={<PaymentResult />} />
            <Route path="/forgot-password"  element={<ForgotPassword />} />
            <Route path="/reset-password"   element={<ResetPassword />} />
            <Route path="/change-password"  element={
              <ProtectedRoute allowedRoles={['admin','manager','staff','user']}>
                <ChangePassword />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['admin','manager','staff','user']}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute allowedRoles={['admin','manager','staff','user']}>
                <History />
              </ProtectedRoute>
            } />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            {/* Fallback for missing pages */}
            <Route path="*" element={<Home />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <AIChatBot />}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
