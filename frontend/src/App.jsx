import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SplashScreen from './components/common/SplashScreen';

// Auth pages
import UserLogin from './pages/auth/UserLogin';
import AdminLogin from './pages/auth/AdminLogin';

// User pages
import UserLayout from './components/layout/UserLayout';
import Dashboard from './pages/user/Dashboard';
import CreateComplaint from './pages/user/CreateComplaint';
import MyComplaints from './pages/user/MyComplaints';
import ComplaintDetail from './pages/user/ComplaintDetail';
import Profile from './pages/user/Profile';
import Disclaimer from './pages/user/Disclaimer';
import LegalPage from './pages/LegalPage';
import TransparencyDashboard from './pages/public/TransparencyDashboard';

// Admin pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaintDetail from './pages/admin/AdminComplaintDetail';
import UserManagement from './pages/admin/UserManagement';
import AdminManagement from './pages/admin/AdminManagement';

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    if (loading) return <SplashScreen />;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
}

export default function App() {
    const { user, loading } = useAuth();

    if (loading) return <SplashScreen />;

    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={user ? <Navigate to={['ADMIN', 'SUPER_ADMIN'].includes(user.role) ? '/admin' : '/dashboard'} replace /> : <UserLogin />} />
            <Route path="/admin/login" element={['ADMIN', 'SUPER_ADMIN'].includes(user?.role) ? <Navigate to="/admin" replace /> : <AdminLogin />} />
            <Route path="/legal/:page" element={<LegalPage />} />

            {/* User routes */}
            <Route path="/" element={<ProtectedRoute allowedRoles={['USER']}><UserLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="complaints/new" element={<CreateComplaint />} />
                <Route path="complaints/:id" element={<ComplaintDetail />} />
                <Route path="complaints" element={<MyComplaints />} />
                <Route path="profile" element={<Profile />} />
                <Route path="disclaimer" element={<Disclaimer />} />
                <Route path="transparency" element={<TransparencyDashboard />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="complaints/:id" element={<AdminComplaintDetail />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="admins" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminManagement /></ProtectedRoute>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
