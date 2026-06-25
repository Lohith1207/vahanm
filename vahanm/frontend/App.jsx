import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { SignupCustomer } from './pages/SignupCustomer';
import { SignupDriver } from './pages/SignupDriver';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { DriverDashboard } from './pages/driver/DriverDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/customer" element={<SignupCustomer />} />
        <Route path="/signup/driver" element={<SignupDriver />} />

        {/* Customer Routes */}
        <Route
          path="/customer/*"
          element={
            <ProtectedRoute allowedRole="customer">
              <ErrorBoundary>
                <CustomerDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        {/* Driver Routes */}
        <Route
          path="/driver/*"
          element={
            <ProtectedRoute allowedRole="driver">
              <ErrorBoundary>
                <DriverDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <ErrorBoundary>
                <AdminDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
