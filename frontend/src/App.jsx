import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import all pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import AssistantLayout from './components/layout/AssistantLayout';
import ClientLayout from './components/layout/ClientLayout';
import DashboardPage from './pages/assistant/DashboardPage';
import InboxPage from './pages/assistant/InboxPage';
import CategoryPage from './pages/assistant/CategoryPage';
import ConversationPage from './pages/assistant/ConversationPage';
import RepliesPage from './pages/assistant/RepliesPage';
import SettingsPage from './pages/assistant/SettingsPage';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientConversation from './pages/client/ClientConversation';

// ProtectedRoute: redirect to /login if not authenticated; redirect if wrong role
function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'client' ? '/client/dashboard' : '/assistant/dashboard'} replace />;
  }
  return children;
}

function RootRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'client' ? '/client/dashboard' : '/assistant/dashboard'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute role="assistant">
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute role="assistant">
            <AssistantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="category/:category" element={<CategoryPage />} />
        <Route path="conversations/:id" element={<ConversationPage />} />
        <Route path="replies" element={<RepliesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route
        path="/client"
        element={
          <ProtectedRoute role="client">
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="conversations/:id" element={<ClientConversation />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
