import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from './store/authStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AuraVoiceAssistant from './components/ui/AuraVoiceAssistant';
import AuraSplash from './components/ui/AuraSplash';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';

// Guard for authenticated routes
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? (children as any) : <Navigate to="/login" replace />;
}

// Guard for admin routes
function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children as any;
}

export default function App() {
  const { initialize } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      {showSplash && <AuraSplash onComplete={() => setShowSplash(false)} />}
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/hotels" element={<HotelsPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />} />
        <Route
          path="/bookings"
          element={<PrivateRoute><BookingsPage /></PrivateRoute>}
        />
        <Route
          path="/profile"
          element={<PrivateRoute><ProfilePage /></PrivateRoute>}
        />
        <Route
          path="/chat"
          element={<PrivateRoute><ChatPage /></PrivateRoute>}
        />
        <Route
          path="/admin"
          element={<AdminRoute><AdminPage /></AdminRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <AuraVoiceAssistant />
    </BrowserRouter>
  );
}
