import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Spinner from './components/common/Spinner';
import Login       from './pages/auth/Login';
import Register    from './pages/auth/Register';
import Dashboard   from './pages/dashboard/Dashboard';
import Loans       from './pages/loans/Loans';
import ApplyLoan   from './pages/loans/ApplyLoan';
import Payments    from './pages/payments/Payments';
import CreditScore from './pages/loans/CreditScore';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"          element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"     element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"  element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/loans"     element={<ProtectedRoute><Loans /></ProtectedRoute>} />
      <Route path="/loans/apply" element={<ProtectedRoute><ApplyLoan /></ProtectedRoute>} />
      <Route path="/payments"  element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/credit"    element={<ProtectedRoute><CreditScore /></ProtectedRoute>} />
      <Route path="*"          element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
