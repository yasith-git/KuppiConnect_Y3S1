import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';

// Landing (Member 1)
import LandingPage from './features/landing/pages/LandingPage';
import AnnouncementsPage from './features/landing/pages/AnnouncementsPage';

// Conductor (Member 2)
import ConductorDashboard from './features/conductor/pages/ConductorDashboard';
import ClassManagementPage from './features/conductor/pages/ClassManagementPage';

// Student (Member 3)
import StudentHome from './features/student/pages/StudentHome';
import StudentRegistrationPage from './features/student/pages/StudentRegistrationPage';

// Content (Member 4)
import ContentPage from './features/content/pages/ContentPage';
import ReviewsPage from './features/content/pages/ReviewsPage';

// Layouts
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './layouts/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />

        {/* Student-only routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentHome />} />
          <Route path="register" element={<StudentRegistrationPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
        </Route>

        {/* Conductor-only routes */}
        <Route
          path="/conductor"
          element={
            <ProtectedRoute role="conductor">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ConductorDashboard />} />
          <Route path="classes" element={<ClassManagementPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

