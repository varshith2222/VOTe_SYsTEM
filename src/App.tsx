import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthForm from './components/AuthForm';
import VotingInterface from './components/VotingInterface';
import AdminDashboard from './pages/AdminDashboard';
import { Web3Provider } from './context/Web3Context';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, userMetadata } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check admin access
  if (requireAdmin && userMetadata?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen">
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
              success: {
                style: {
                  background: '#059669',
                },
              },
              error: {
                style: {
                  background: '#DC2626',
                },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<AuthForm />} />
            <Route path="/admin" element={<AuthForm isAdmin />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vote"
              element={
                <ProtectedRoute>
                  <VotingInterface />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;