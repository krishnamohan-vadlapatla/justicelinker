import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, LogOut, Bell, ShieldCheck, Menu, X, PanelLeftClose, PanelLeft, Mail } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const adminLinks = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/users', icon: Users, label: 'Users' },
    ];

    if (user?.role === 'SUPER_ADMIN') {
        adminLinks.push({ to: '/admin/admins', icon: ShieldCheck, label: 'Admins' });
    }

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col">
            {/* Desktop Header - Top Bar with Actions */}
            <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-dark-card/95 backdrop-blur-xl border-b border-dark-border z-50">
                <div className={`flex-1 flex items-center justify-between px-4 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    {/* Left: Logo + Brand */}
                    <NavLink to="/admin" className="flex items-center gap-2.5 shrink-0">
                        <img src="/JusticeLinker-favicon.png" alt="JusticeLinker" className="w-8 h-8 rounded" />
                        <span className="font-bold text-lg tracking-tight">
                            <span className="text-navy-200">Justice</span>
                            <span className="text-brand-orange">Linker</span>
                        </span>
                        <span className="text-[10px] text-gray-500 ml-2">
                            {user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN'}
                        </span>
                    </NavLink>

                    {/* Right: Actions - Notifications, Profile, Logout */}
                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                            <Bell size={20} />
                        </button>

                        {/* Profile */}
                        <button className="flex items-center gap-2 hover:bg-white/5 p-1.5 pr-3 rounded-lg transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-navy-400 flex items-center justify-center text-sm font-bold">
                                {user?.fullName?.[0] || 'A'}
                            </div>
                            <span className="text-sm text-gray-300">{user?.fullName || 'Admin'}</span>
                        </button>

                        {/* Logout */}
                        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10" title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Desktop Sidebar - Navigation Only */}
            <aside className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-dark-card border-r border-dark-border z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-dark-border">
                    <NavLink to="/admin" className="flex items-center gap-2.5 shrink-0 group">
                        <img src="/JusticeLinker-favicon.png" alt="JusticeLinker" className="w-8 h-8 rounded group-hover:scale-105 transition-transform" />
                        {sidebarOpen && (
                            <span className="font-bold text-lg tracking-tight whitespace-nowrap">
                                <span className="text-navy-200">Justice</span>
                                <span className="text-brand-orange">Linker</span>
                            </span>
                        )}
                    </NavLink>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                    </button>
                </div>

                {/* Admin Badge */}
                {sidebarOpen && (
                    <div className="px-4 py-3 border-b border-dark-border">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-brand-orange/10 text-brand-orange text-[10px] font-semibold tracking-wide">
                            {user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN'}
                        </span>
                    </div>
                )}

                {/* Navigation Links Only */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {adminLinks.map(({ to, icon: Icon, label, end }) => (
                        <NavLink key={to} to={to} end={end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-brand-orange/10 text-brand-orange'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                } ${!sidebarOpen ? 'justify-center' : ''}`
                            }>
                            <Icon size={20} />
                            {sidebarOpen && <span>{label}</span>}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-dark-card/95 backdrop-blur-xl border-b border-dark-border z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Menu size={24} />
                    </button>
                    <NavLink to="/admin" className="flex items-center gap-2">
                        <img src="/JusticeLinker-favicon.png" alt="JusticeLinker" className="w-8 h-8 rounded" />
                        <span className="font-bold text-base">
                            <span className="text-navy-200">Justice</span>
                            <span className="text-brand-orange">Linker</span>
                        </span>
                    </NavLink>
                </div>
                <div className="flex items-center gap-1">
                    {/* Admin Badge */}
                    <span className="px-2 py-1 rounded-md bg-brand-orange/10 text-brand-orange text-[10px] font-semibold mr-1">
                        {user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN'}
                    </span>
                    {/* Profile */}
                    <button className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-navy-400 flex items-center justify-center text-xs font-bold">
                        {user?.fullName?.[0] || 'A'}
                    </button>
                    {/* Logout */}
                    <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-72 bg-dark-card border-r border-dark-border shadow-2xl animate-slide-in">
                        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-border">
                            <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                                <img src="/JusticeLinker-favicon.png" alt="JusticeLinker" className="w-8 h-8 rounded" />
                                <span className="font-bold text-base">
                                    <span className="text-navy-200">Justice</span>
                                    <span className="text-brand-orange">Linker</span>
                                </span>
                            </NavLink>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="px-4 py-3 border-b border-dark-border">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-brand-orange/10 text-brand-orange text-[10px] font-semibold tracking-wide">
                                {user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN'}
                            </span>
                        </div>
                        <nav className="p-3 space-y-1">
                            {adminLinks.map(({ to, icon: Icon, label, end }) => (
                                <NavLink key={to} to={to} end={end} onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? 'bg-brand-orange/10 text-brand-orange'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }>
                                    <Icon size={20} />
                                    {label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={`flex-1 pt-16 md:pt-0 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-6">
                    <Outlet />
                </div>

                {/* Professional Footer - Desktop */}
                <footer className="hidden md:block border-t border-dark-border bg-dark-card/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* About Section */}
                            <div className="sm:col-span-2 lg:col-span-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <img src="/JusticeLinker-favicon.png" alt="" className="w-6 h-6 rounded" />
                                    <span className="font-bold text-sm">
                                        <span className="text-navy-200">Justice</span>
                                        <span className="text-brand-orange">Linker</span>
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                                    Independent grievance reporting platform for Andhra Pradesh citizens.
                                </p>
                                <a href="mailto:justicelinker.official@gmail.com?subject=JusticeLinker%20Support%20Request"
                                    className="inline-flex items-center gap-2 text-xs text-brand-orange/80 hover:text-brand-orange transition-colors group">
                                    <Mail size={12} className="shrink-0" />
                                    <span className="group-hover:underline">justicelinker.official@gmail.com</span>
                                </a>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-300 mb-3">Quick Links</h4>
                                <ul className="space-y-2">
                                    <li><NavLink to="/admin" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">Dashboard</NavLink></li>
                                    <li><NavLink to="/admin/users" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">Users</NavLink></li>
                                    {user?.role === 'SUPER_ADMIN' && (
                                        <li><NavLink to="/admin/admins" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">Admins</NavLink></li>
                                    )}
                                </ul>
                            </div>

                            {/* Legal */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-300 mb-3">Legal</h4>
                                <ul className="space-y-2">
                                    <li><NavLink to="/legal/privacy-policy" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">Privacy Policy</NavLink></li>
                                    <li><NavLink to="/legal/terms" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">Terms of Service</NavLink></li>
                                    <li><NavLink to="/legal/disclaimer" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">Disclaimer</NavLink></li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-300 mb-3">Contact</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <a href="mailto:justicelinker.official@gmail.com?subject=JusticeLinker%20Support%20Request"
                                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-brand-orange transition-colors group">
                                            <Mail size={12} className="shrink-0 text-brand-orange/60" />
                                            <span className="group-hover:underline">Mail Us</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="mt-8 pt-6 border-t border-dark-border">
                            <div className="flex flex-col items-center text-center">
                                <p className="text-[11px] text-gray-500">
                                    © {new Date().getFullYear()} JusticeLinker. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card/95 backdrop-blur-xl border-t border-dark-border z-40">
                <div className="flex items-center justify-around h-16">
                    {adminLinks.map(({ to, icon: Icon, label, end }) => (
                        <NavLink key={to} to={to} end={end}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive ? 'text-brand-orange' : 'text-gray-500'}`
                            }>
                            <Icon size={20} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
}
