import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Component, lazy, Suspense } from 'react';

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#fff', background: '#1a0a0a', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#F87171', marginBottom: 16 }}>Une erreur est survenue</h2>
          <pre style={{ background: '#2a0a0a', padding: 16, borderRadius: 8, overflow: 'auto', color: '#fca5a5', fontSize: 13, maxHeight: 300 }}>
            {this.state.error.toString()}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
            style={{ marginTop: 16, padding: '8px 20px', background: '#C1272D', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Retour à l'accueil
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid rgba(193,39,45,0.2)',
        borderTopColor: '#C1272D',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}

// Pages chargées au démarrage (critiques — above the fold)
import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import NotFound      from './pages/NotFound';
import Onboarding    from './pages/Onboarding';

// Pages lazy-loadées (chargées à la demande)
const SearchRides      = lazy(() => import('./pages/SearchRides'));
const RideDetail       = lazy(() => import('./pages/RideDetail'));
const PublishRide      = lazy(() => import('./pages/PublishRide'));
const MyRides          = lazy(() => import('./pages/MyRides'));
const MyBookings       = lazy(() => import('./pages/MyBookings'));
const Profile          = lazy(() => import('./pages/Profile'));
const Messages         = lazy(() => import('./pages/Messages'));
const AdminDashboard   = lazy(() => import('./pages/AdminDashboard'));
const EditRide         = lazy(() => import('./pages/EditRide'));
const WriteReview      = lazy(() => import('./pages/WriteReview'));
const Feed             = lazy(() => import('./pages/Feed'));
const ForgotPassword   = lazy(() => import('./pages/ForgotPassword'));
const DriverDashboard  = lazy(() => import('./pages/DriverDashboard'));
const Friends          = lazy(() => import('./pages/Friends'));
const Compare          = lazy(() => import('./pages/Compare'));
const WalletPage       = lazy(() => import('./pages/Wallet'));
const Leaderboard      = lazy(() => import('./pages/Leaderboard'));
const DriverAnalytics  = lazy(() => import('./pages/DriverAnalytics'));
const LoginHistory     = lazy(() => import('./pages/LoginHistory'));
const Stories          = lazy(() => import('./pages/Stories'));
const Groups           = lazy(() => import('./pages/Groups'));
const Events           = lazy(() => import('./pages/Events'));
const Premium          = lazy(() => import('./pages/Premium'));
const Support          = lazy(() => import('./pages/Support'));
const RideAlerts       = lazy(() => import('./pages/RideAlerts'));
const EmergencyContacts = lazy(() => import('./pages/EmergencyContacts'));
const Favorites         = lazy(() => import('./pages/Favorites'));
const Notifications     = lazy(() => import('./pages/Notifications'));
const TrackRide             = lazy(() => import('./pages/TrackRide'));
const EnterpriseDashboard   = lazy(() => import('./pages/EnterpriseDashboard'));

import SOSButton           from './components/SOSButton';
import AccessibilityWidget from './components/AccessibilityWidget';
import { HelmetProvider }  from 'react-helmet-async';

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
      <SOSButton />
      <AccessibilityWidget />
      <main className="flex-1 page-enter">
        <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
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
          <Route path="/feed"             element={<Feed />} />
          <Route path="/compare"          element={<Compare />} />
          <Route path="/onboarding"       element={<Onboarding />} />
          <Route path="/driver-dashboard"  element={<PrivateRoute><DriverDashboard /></PrivateRoute>} />
          <Route path="/friends"           element={<PrivateRoute><Friends /></PrivateRoute>} />
          <Route path="/wallet"            element={<PrivateRoute><WalletPage /></PrivateRoute>} />
          <Route path="/leaderboard"       element={<Leaderboard />} />
          <Route path="/analytics/driver"  element={<PrivateRoute><DriverAnalytics /></PrivateRoute>} />
          <Route path="/login-history"     element={<PrivateRoute><LoginHistory /></PrivateRoute>} />
          <Route path="/stories"           element={<Stories />} />
          <Route path="/groups"            element={<Groups />} />
          <Route path="/events"            element={<Events />} />
          <Route path="/premium"           element={<PrivateRoute><Premium /></PrivateRoute>} />
          <Route path="/support"           element={<PrivateRoute><Support /></PrivateRoute>} />
          <Route path="/ride-alerts"       element={<PrivateRoute><RideAlerts /></PrivateRoute>} />
          <Route path="/favorites"         element={<PrivateRoute><Favorites /></PrivateRoute>} />
          <Route path="/emergency-contacts" element={<PrivateRoute><EmergencyContacts /></PrivateRoute>} />
          <Route path="/notifications"     element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/track/:rideId"      element={<TrackRide />} />
          <Route path="/enterprise"       element={<PrivateRoute><EnterpriseDashboard /></PrivateRoute>} />
          <Route path="*"                  element={<NotFound />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}
