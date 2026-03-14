import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Home, FileText, User, LogOut, Bell, Menu, X, Activity, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getMyNotifications } from '../../api';

export default function UserLayout() {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        { to: '/transparency', icon: Activity, label: t('nav.transparency') },
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
        <div className="min-h-screen bg-dark-bg flex">
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-dark-card border-r border-dark-border z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-dark-border">
                    <NavLink to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
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

                {/* Navigation Links */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {links.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)}
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

                {/* Bottom Section - Language & User */}
                <div className={`p-3 border-t border-dark-border ${!sidebarOpen ? 'flex flex-col items-center gap-2' : ''}`}>
                    {/* Language Switcher */}
                    <div className={`flex items-center gap-0.5 bg-dark-input rounded-lg p-0.5 ${!sidebarOpen ? 'flex-col' : ''}`}>
                        <button onClick={() => changeLang('en')} title="English"
                            className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${i18n.language === 'en' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'}`}>
                            {sidebarOpen ? 'EN' : 'E'}
                        </button>
                        <button onClick={() => changeLang('te')} title="Telugu"
                            className={`px-2 py-1.5 rounded text-xs font-medium transition-all font-telugu ${i18n.language === 'te' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'}`}>
                            {sidebarOpen ? 'తె' : 'త'}
                        </button>
                        <button onClick={() => changeLang('hi')} title="Hindi"
                            className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${i18n.language === 'hi' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'}`}>
                            {sidebarOpen ? 'हि' : 'ह'}
                        </button>
                    </div>

                    {/* Profile & Logout */}
                    {sidebarOpen ? (
                        <div className="flex items-center justify-between mt-3">
                            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded-lg transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-navy-400 flex items-center justify-center text-sm font-bold">
                                    {user?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm text-gray-300 truncate max-w-[80px]">{user?.fullName || 'User'}</span>
                            </button>
                            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10" title={t('nav.logout')}>
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 mt-2">
                            <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-navy-400 flex items-center justify-center text-sm font-bold hover:ring-2 hover:ring-brand-orange/50 transition-all">
                                {user?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                            </button>
                            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 mx-auto" title={t('nav.logout')}>
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-dark-card/95 backdrop-blur-xl border-b border-dark-border z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Menu size={24} />
                    </button>
                    <NavLink to="/dashboard" className="flex items-center gap-2">
                        <img src="/JusticeLinker-favicon.png" alt="JusticeLinker" className="w-8 h-8 rounded" />
                        <span className="font-bold text-base">
                            <span className="text-navy-200">Justice</span>
                            <span className="text-brand-orange">Linker</span>
                        </span>
                    </NavLink>
                </div>
                <div className="flex items-center gap-1">
                    {/* Language Switcher */}
                    <div className="flex items-center gap-0.5 bg-dark-input rounded-lg p-0.5">
                        <button onClick={() => changeLang('en')} className={`px-1.5 py-1 rounded text-[10px] font-medium ${i18n.language === 'en' ? 'bg-brand-orange text-white' : 'text-gray-400'}`}>E</button>
                        <button onClick={() => changeLang('te')} className={`px-1.5 py-1 rounded text-[10px] font-medium ${i18n.language === 'te' ? 'bg-brand-orange text-white' : 'text-gray-400'}`}>త</button>
                        <button onClick={() => changeLang('hi')} className={`px-1.5 py-1 rounded text-[10px] font-medium ${i18n.language === 'hi' ? 'bg-brand-orange text-white' : 'text-gray-400'}`}>ह</button>
                    </div>
                    {/* Profile */}
                    <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-navy-400 flex items-center justify-center text-xs font-bold ml-1">
                        {user?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
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
                            <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
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
                        <nav className="p-3 space-y-1">
                            {links.map(({ to, icon: Icon, label }) => (
                                <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)}
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
            <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} pt-16 md:pt-0`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
                    {/* Desktop Notification Bell (top right) */}
                    <div className="hidden md:flex justify-end mb-4">
                        <div className="relative" ref={notifRef}>
                            <button onClick={toggleNotifs} className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-orange rounded-full pulse-dot" />
                                )}
                            </button>
                            {showNotifs && (
                                <div className="absolute right-0 top-12 w-80 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
                                        <h4 className="text-sm font-semibold text-gray-200">{t('nav.notifications')}</h4>
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
                                            <div className="text-center py-8 text-gray-500 text-xs px-4">
                                                <Bell size={24} className="mx-auto mb-2 opacity-30" />
                                                {t('nav.no_notifications')}
                                            </div>
                                        ) : (
                                            notifications.map((n, i) => (
                                                <button key={i} onClick={() => { setShowNotifs(false); navigate(`/complaints/${n.complaintId}`); }}
                                                    className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-dark-border/50 transition-colors">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-mono text-brand-orange">{n.complaintId}</span>
                                                        <span className="text-[10px] text-gray-600">
                                                            {new Date(n.changedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-300 truncate mb-1">{n.subject}</p>
                                                    <div className="flex items-center gap-1 text-[11px]">
                                                        <span className="text-gray-500">{n.fromStatus ? t(`status.${n.fromStatus}`) : 'New'}</span>
                                                        <span className="text-gray-600">→</span>
                                                        <span className="text-brand-orange font-medium">{t(`status.${n.toStatus}`)}</span>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card/95 backdrop-blur-xl border-t border-dark-border z-40">
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
                </div>
            </nav>

            {/* Footer - Desktop Only */}
            <footer className={`hidden md:block fixed bottom-0 right-0 ${sidebarOpen ? 'left-64' : 'left-20'} transition-all duration-300 border-t border-dark-border bg-dark-card/80`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col items-center text-center gap-1">
                        <p className="text-[11px] text-gray-500 font-medium">
                            © {new Date().getFullYear()} JusticeLinker · {t('footer.copyright')}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
