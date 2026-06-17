import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import Organizations from '../pages/Organizations';
import MockInterviews from '../pages/MockInterviews';
import PhysicalPlan from '../pages/PhysicalPlan';
import MedicalChecklist from '../pages/MedicalChecklist';
import ReadinessHub from '../pages/ReadinessHub';
import Profile from '../pages/Profile';
import VoiceInterview from '../pages/VoiceInterview';

// Admin Pages
import AdminLayout from '../pages/admin/AdminLayout';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminOrganizations from '../pages/admin/AdminOrganizations';
import AdminQuestions from '../pages/admin/AdminQuestions';
import AdminBookUpload from '../pages/admin/AdminBookUpload';
import AdminAnalytics from '../pages/admin/AdminAnalytics';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Admin Login Route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Protected Panel */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="departments" element={<AdminOrganizations />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="upload-book" element={<AdminBookUpload />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      {/* Protected Main App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/departments" element={<Organizations />} />
        
        {/* SEO Friendly Department Routes */}
        <Route path="/department/:slug" element={<ReadinessHub />} />
        <Route path="/department/:slug/interview" element={<MockInterviews />} />
        <Route path="/department/:slug/medical" element={<MedicalChecklist />} />
        <Route path="/department/:slug/physical" element={<PhysicalPlan />} />

        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Full screen standalone voice interview */}
      <Route
        path="/interviews/voice/:sessionId"
        element={
          <ProtectedRoute>
            <VoiceInterview />
          </ProtectedRoute>
        }
      />

      {/* Fallback redirects */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
