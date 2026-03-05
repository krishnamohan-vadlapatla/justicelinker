import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Home, FileText, User, LogOut, Bell, Mail, ShieldCheck, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getMyNotifications } from '../../api';

export default function UserLayout() {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);
    const notifRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const changeLang = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('lang', lng);
    };

    const links = [
        { to: '/dashboard', icon: Home, label: t('nav.home') },
        { to: '/complaints', icon: FileText, label: t('nav.complaints') },
        { to: '/profile', icon: User, label: t('nav.profile') },
    ];

    const fetchNotifications = async () => {
        setNotifLoading(true);
        try {
            const res = await getMyNotifications();
            setNotifications(res.data || []);
        } catch { setNotifications([]); }
        setNotifLoading(false);
    };

    const toggleNotifs = () => {
        if (!showNotifs) fetchNotifications();
        setShowNotifs(!showNotifs);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col">
            {/* Top Navbar */}
            <nav className="sticky top-0 z-50 bg-dark-card/90 backdrop-blur-xl border-b border-dark-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                    {/* Left: Logo + Brand */}
                    <NavLink to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
                        <img src="/JusticeLinker-favicon.png" alt="JusticeLinker"
                            className="w-8 h-8 rounded group-hover:scale-105 transition-transform" />
                        <span className="font-bold text-lg tracking-tight">
                            <span className="text-navy-200">Justice</span>
                            <span className="text-brand-orange">Linker</span>
                        </span>
                    </NavLink>

                    {/* Center: Navigation Links (Desktop) */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map(({ to, icon: Icon, label }) => (
                            <NavLink key={to} to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-brand-orange/10 text-brand-orange'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`
                                }>
                                <Icon size={16} />
                                {label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Language Switcher */}
                        <div className="flex items-center gap-0.5 bg-dark-input rounded-lg p-0.5">
                            <button onClick={() => changeLang('en')}
                                className={`px-2 py-1 rounded text-xs font-medium transition-all ${i18n.language === 'en' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'}`}>
                                EN
                            </button>
                            <button onClick={() => changeLang('te')}
                                className={`px-2 py-1 rounded text-xs font-medium transition-all font-telugu ${i18n.language === 'te' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'}`}>
                                తె
                            </button>
                            <button onClick={() => changeLang('hi')}
                                className={`px-2 py-1 rounded text-xs font-medium transition-all ${i18n.language === 'hi' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'}`}>
                                हि
                            </button>
                        </div>

                        {/* Notification Bell */}
                        <div className="relative" ref={notifRef}>
                            <button onClick={toggleNotifs}
                                className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                <Bell size={18} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-orange rounded-full pulse-dot" />
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifs && (
                                <div className="absolute right-0 top-12 w-80 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
                                        <h4 className="text-sm font-semibold text-gray-200">Notifications</h4>
                                        <button onClick={() => setShowNotifs(false)} className="text-gray-500 hover:text-white">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifLoading ? (
                                            <div className="flex justify-center py-8">
                                                <div className="animate-spin w-5 h-5 border-2 border-brand-orange border-t-transparent rounded-full" />
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500 text-xs">
                                                <Bell size={24} className="mx-auto mb-2 opacity-30" />
                                                No notifications yet
                                            </div>
                                        ) : (
                                            notifications.map((n, i) => (
                                                <button key={i}
                                                    onClick={() => { setShowNotifs(false); navigate(`/complaints/${n.complaintId}`); }}
                                                    className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-dark-border/50 transition-colors">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-mono text-brand-orange">{n.complaintId}</span>
                                                        <span className="text-[10px] text-gray-600">
                                                            {new Date(n.changedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-300 truncate mb-1">{n.subject}</p>
                                                    <div className="flex items-center gap-1 text-[11px]">
                                                        <span className="text-gray-500">{n.fromStatus?.replace('_', ' ') || 'New'}</span>
                                                        <span className="text-gray-600">→</span>
                                                        <span className="text-brand-orange font-medium">{n.toStatus?.replace('_', ' ')}</span>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Avatar (first letter only) */}
                        <button onClick={() => navigate('/profile')}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-navy-400 flex items-center justify-center text-sm font-bold shrink-0 hover:ring-2 hover:ring-brand-orange/50 transition-all">
                            {user?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                        </button>

                        {/* Logout */}
                        <button onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                            title={t('nav.logout')}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
                <Outlet />
            </main>

            {/* ===== PROFESSIONAL FOOTER ===== */}
            <footer className="border-t border-dark-border bg-dark-card/80 mt-auto">
                {/* Main Footer Content */}
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
                                {t('footer.about_desc')}
                            </p>
                            <a href="mailto:justicelinker.official@gmail.com?subject=JusticeLinker%20Support%20Request"
                                className="inline-flex items-center gap-2 text-xs text-brand-orange/80 hover:text-brand-orange transition-colors group">
                                <Mail size={12} className="shrink-0" />
                                <span className="group-hover:underline">justicelinker.official@gmail.com</span>
                            </a>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-3">{t('footer.quick_links')}</h4>
                            <ul className="space-y-2">
                                <li><NavLink to="/dashboard" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">{t('nav.home')}</NavLink></li>
                                <li><NavLink to="/complaints/new" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">{t('dashboard.file_complaint')}</NavLink></li>
                                <li><NavLink to="/complaints" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">{t('nav.complaints')}</NavLink></li>
                                <li><NavLink to="/profile" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">{t('nav.profile')}</NavLink></li>
                            </ul>
                        </div>

                        {/* Legal & Transparency */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-3">{t('footer.legal')}</h4>
                            <ul className="space-y-2">
                                <li><NavLink to="/legal/privacy-policy" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">{t('footer.privacy_policy')}</NavLink></li>
                                <li><NavLink to="/legal/terms" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">{t('footer.terms')}</NavLink></li>
                                <li><NavLink to="/legal/disclaimer" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">{t('footer.disclaimer')}</NavLink></li>
                                <li><NavLink to="/legal/data-protection" className="text-xs text-gray-400 hover:text-brand-orange transition-colors">{t('footer.data_protection')}</NavLink></li>
                            </ul>
                        </div>

                        {/* Contact & Support */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-3">{t('footer.contact')}</h4>
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

                    {/* Independent Disclaimer */}
                    <div className="mt-8 pt-6 border-t border-dark-border">
                        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                {t('footer.independent_disclaimer')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Copyright Bar */}
                <div className="border-t border-dark-border bg-dark-bg/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                        <div className="flex flex-col items-center text-center gap-2">
                            <p className="text-xs text-gray-500 font-medium">
                                © {new Date().getFullYear()} JusticeLinker · {t('footer.copyright')}
                            </p>
                            <p className="text-[11px] text-gray-600">
                                {t('footer.built_for')}
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card/95 backdrop-blur-xl border-t border-dark-border z-50">
                <div className="flex items-center justify-around h-16">
                    {links.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive ? 'text-brand-orange' : 'text-gray-500'}`
                            }>
                            <Icon size={20} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </NavLink>
                    ))}
                    <button onClick={handleLogout} className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500">
                        <LogOut size={20} />
                        <span className="text-[10px] font-medium">{t('nav.logout')}</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
