import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { CoursesPage, CourseDetailPage, MovementPage } from '@/pages/CoursesPage';
import { VolunteerPage } from '@/pages/VolunteerPage';
import { LessonsPage } from '@/pages/LessonsPage';
import { PortalPage } from '@/pages/PortalPage';
import { TrainingPage, TrainingModulePage } from '@/pages/TrainingPage';
import { SchedulePage } from '@/pages/SchedulePage';
import { LoginPage } from '@/pages/LoginPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:family" element={<CourseDetailPage />} />
            <Route path="/courses/:family/movements/:index" element={<MovementPage />} />
            <Route path="/volunteer" element={<VolunteerPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <PortalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/training"
              element={
                <ProtectedRoute>
                  <TrainingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/training/:index"
              element={
                <ProtectedRoute>
                  <TrainingModulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/schedule"
              element={
                <ProtectedRoute>
                  <SchedulePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
