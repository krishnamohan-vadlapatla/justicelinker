import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, LogOut, Search, Bell, ShieldCheck } from 'lucide-react';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-dark-bg">
            {/* Admin Navbar */}
            <nav className="sticky top-0 z-50 bg-dark-card/90 backdrop-blur-xl border-b border-dark-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <img src="/JusticeLinker-favicon.png" alt="JusticeLinker" className="w-8 h-8 rounded" />
                        <div>
                            <span className="font-bold text-lg">
                                <span className="text-navy-200">Justice</span>
                                <span className="text-brand-orange">Linker</span>
                            </span>
                            <span className="text-[10px] text-gray-500 ml-2 hidden sm:inline">
                                {user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN'}
                            </span>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className="hidden sm:flex items-center gap-6">
                        <NavLink to="/admin" end
                            className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
                            Dashboard
                        </NavLink>
                        <NavLink to="/admin/users"
                            className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
                            Users
                        </NavLink>
                        {user?.role === 'SUPER_ADMIN' && (
                            <NavLink to="/admin/admins"
                                className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
                                Admins
                            </NavLink>
                        )}
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-navy-400 flex items-center justify-center text-sm font-bold">
                                {user?.fullName?.[0] || 'A'}
                            </div>
                            <span className="text-sm text-gray-300 hidden sm:block">{user?.fullName || 'Admin'}</span>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-6">
                <Outlet />
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-dark-card/95 backdrop-blur-xl border-t border-dark-border z-50">
                <div className="flex items-center justify-around h-16">
                    <NavLink to="/admin" end
                        className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-2 ${isActive ? 'text-brand-orange' : 'text-gray-500'}`}>
                        <LayoutDashboard size={20} />
                        <span className="text-[10px] font-medium">Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/users"
                        className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-2 ${isActive ? 'text-brand-orange' : 'text-gray-500'}`}>
                        <Users size={20} />
                        <span className="text-[10px] font-medium">Users</span>
                    </NavLink>
                    {user?.role === 'SUPER_ADMIN' && (
                        <NavLink to="/admin/admins"
                            className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-2 ${isActive ? 'text-brand-orange' : 'text-gray-500'}`}>
                            <ShieldCheck size={20} />
                            <span className="text-[10px] font-medium">Admins</span>
                        </NavLink>
                    )}
                    <button onClick={handleLogout} className="flex flex-col items-center gap-1 px-4 py-2 text-gray-500">
                        <LogOut size={20} />
                        <span className="text-[10px] font-medium">Logout</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
