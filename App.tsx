
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from '@sentry/react';
import { GlobalErrorFallback } from './src/components/ui/GlobalErrorFallback';
import ScrollToTop from './src/components/ScrollToTop';
import Layout from './src/components/Layout';
import DashboardWrapper from './src/components/layout/DashboardWrapper';
import { ChunkErrorBoundary } from './src/components/ChunkErrorBoundary';
import { ProtectedRoute } from './src/components/ProtectedRoute';
import { Toaster } from 'sonner';
import { useAuth } from './src/contexts/AuthContext';
import { UserRole, User } from './src/types';

// Helper to retry dynamic imports and reload on chunk/network failures
const lazyRetry = (componentImport: () => Promise<any>) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error: any) {
      const isChunkError = 
        /failed to fetch/i.test(error.message) ||
        /dynamically imported module/i.test(error.message) ||
        /chunk/i.test(error.message);

      if (isChunkError) {
        console.warn("Vite chunk/dynamic import failure caught in loader. Forcing reload to fetch updated assets...");
        
        const reloadKey = 'chunk-load-failed-reload';
        const lastReload = sessionStorage.getItem(reloadKey);
        const now = Date.now();
        
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem(reloadKey, now.toString());
          window.location.reload();
          // Keep promise pending so browser doesn't render crashed fallback UI before reload
          return new Promise(() => {});
        }
      }
      throw error;
    }
  });
};

// Lazy load pages for better performance and smaller bundle sizes wrapped in resilient retry
const LandingPage = lazyRetry(() => import('./pages/Landing'));
const ApplicationPage = lazyRetry(() => import('./pages/Application'));
const UserDashboard = lazyRetry(() => import('./pages/UserDashboard'));
const BookingPage = lazyRetry(() => import('./pages/Booking'));
const SettingsPage = lazyRetry(() => import('./pages/Settings'));
const SurveyPage = lazyRetry(() => import('./pages/Survey'));
const AuthPage = lazyRetry(() => import('./pages/Auth'));
const StorePage = lazyRetry(() => import('./pages/Store'));
const ResetPasswordPage = lazyRetry(() => import('./pages/ResetPassword'));
const AboutPage = lazyRetry(() => import('./pages/About'));
const ProgramsPage = lazyRetry(() => import('./pages/Programs'));
const GrowthFormPage = lazyRetry(() => import('./pages/GrowthForm'));
const ConsultationOverviewPage = lazyRetry(() => import('./pages/ConsultationOverview'));
const FAQPage = lazyRetry(() => import('./pages/FAQ'));
const ContactPage = lazyRetry(() => import('./pages/Contact'));
const TermsPage = lazyRetry(() => import('./pages/Terms'));
const PrivacyPage = lazyRetry(() => import('./pages/Privacy'));
const MentorDashboard = lazyRetry(() => import('./pages/MentorDashboard'));
const AdminDashboard = lazyRetry(() => import('./pages/AdminDashboard'));
const NotFound = lazyRetry(() => import('./pages/NotFound'));

const AnimatedRoutes: React.FC<{
  currentRole: UserRole;
  currentUser: User | null;
  handleLogout: () => void;
}> = ({ currentRole, currentUser, handleLogout }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage currentRole={currentRole} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/growth-strategy" element={<GrowthFormPage />} />
          <Route path="/consultation" element={<ConsultationOverviewPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          
          <Route path="/apply" element={<ApplicationPage />} />
          
          <Route path="/auth" element={
            currentRole !== 'visitor' ? <Navigate to="/dashboard" /> : <AuthPage onLogin={() => {}} />
          } />
          
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardWrapper 
                currentRole={currentRole} 
                currentUser={currentUser} 
                MentorDashboard={MentorDashboard}
                UserDashboard={UserDashboard}
                AdminDashboard={AdminDashboard}
              />
            </ProtectedRoute>
          } />

          <Route path="/mentor/applications" element={
            currentRole === 'mentor' ? <Navigate to="/dashboard?tab=mentees" /> : <Navigate to="/dashboard" />
          } />

          <Route path="/booking" element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage onLogout={handleLogout} currentUser={currentUser} />
            </ProtectedRoute>
          } />

          <Route path="/survey" element={
            <ProtectedRoute>
              <SurveyPage />
            </ProtectedRoute>
          } />

          <Route path="/vault" element={
            <ProtectedRoute>
              <StorePage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const { user: currentUser, role: currentRole, authLoading, signOut: handleLogout } = useAuth();
  
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <ErrorBoundary
        FallbackComponent={GlobalErrorFallback}
        onError={(error, info) => {
          console.error('Global Error Boundary caught:', error, info);
          Sentry.captureException(error, { extra: info });
        }}
        onReset={() => {
          window.location.reload();
        }}
      >
        <Router>
          <Toaster richColors position="top-right" />
          <ScrollToTop />
          <Layout role={currentRole}>
            <ChunkErrorBoundary>
              <Suspense fallback={
                <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                <AnimatedRoutes 
                  currentRole={currentRole} 
                  currentUser={currentUser} 
                  handleLogout={handleLogout} 
                />
              </Suspense>
            </ChunkErrorBoundary>
          </Layout>
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
