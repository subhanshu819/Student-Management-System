import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StudentsListPage from './pages/StudentsListPage.jsx';
import StudentDetailsPage from './pages/StudentDetailsPage.jsx';
import AddStudentPage from './pages/AddStudentPage.jsx';
import EditStudentPage from './pages/EditStudentPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Application Layout Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/students/:id" element={<StudentDetailsPage />} />
              <Route path="/students/:id/edit" element={<EditStudentPage />} />

              {/* Admin-only directory & creation routes */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/students" element={<StudentsListPage />} />
                <Route path="/students/new" element={<AddStudentPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallbacks */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
