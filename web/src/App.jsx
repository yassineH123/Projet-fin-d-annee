import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import SearchRides   from './pages/SearchRides';
import RideDetail    from './pages/RideDetail';
import PublishRide   from './pages/PublishRide';
import MyRides       from './pages/MyRides';
import MyBookings    from './pages/MyBookings';
import Profile       from './pages/Profile';
import Messages      from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';
import EditRide      from './pages/EditRide';
import WriteReview   from './pages/WriteReview';
import Onboarding    from './pages/Onboarding';
import NotFound      from './pages/NotFound';
import Feed           from './pages/Feed';
import ForgotPassword from './pages/ForgotPassword';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingDone === false) return <Navigate to="/onboarding" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user && ['admin', 'superadmin'].includes(user.role) ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/rides/search"   element={<SearchRides />} />
          <Route path="/rides/:id"      element={<RideDetail />} />
          <Route path="/rides/publish"  element={<PrivateRoute><PublishRide /></PrivateRoute>} />
          <Route path="/rides/mine"      element={<PrivateRoute><MyRides /></PrivateRoute>} />
          <Route path="/rides/:id/edit" element={<PrivateRoute><EditRide /></PrivateRoute>} />
          <Route path="/reviews/write"  element={<PrivateRoute><WriteReview /></PrivateRoute>} />
          <Route path="/bookings"       element={<PrivateRoute><MyBookings /></PrivateRoute>} />
          <Route path="/profile"        element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/:id"    element={<Profile />} />
          <Route path="/messages"       element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/feed"          element={<Feed />} />
          <Route path="/onboarding"    element={<Onboarding />} />
          <Route path="*"              element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
