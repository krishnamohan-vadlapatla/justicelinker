import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { FilePlus, FileText, User, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const limitReached = user?.maxComplaintsExceeded;

    return (
        <div className="space-y-6 fade-in">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                    {t('dashboard.welcome')}, <span className="text-brand-orange">{user?.fullName || user?.email?.split('@')[0] || 'User'}</span>
                </h1>
                {/* Complaint usage indicator */}
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                    <span>{user?.complaintsThisMonth || 0} {t('dashboard.of')} {user?.maxComplaintsPerMonth || 5} {t('dashboard.complaints_used')}</span>
                    <div className="flex-1 max-w-32 h-2 bg-dark-input rounded-full overflow-hidden">
                        <div className="h-full bg-brand-orange rounded-full transition-all"
                            style={{ width: `${((user?.complaintsThisMonth || 0) / (user?.maxComplaintsPerMonth || 5)) * 100}%` }} />
                    </div>
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Create Complaint */}
                <div className="card-hover flex flex-col items-center text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-4">
                        <FilePlus size={32} className="text-brand-orange" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">{t('dashboard.create_complaint')}</h2>
                    <p className="text-gray-400 text-sm mb-4">{t('dashboard.create_desc')}</p>
                    <button
                        onClick={() => navigate(limitReached ? '#' : '/complaints/new')}
                        disabled={limitReached}
                        className="btn-primary">
                        {limitReached ? t('complaint.limit_reached') : t('dashboard.file_complaint')}
                    </button>
                    {limitReached && (
                        <p className="text-xs text-status-rejected mt-2 flex items-center gap-1">
                            <AlertTriangle size={12} /> {t('complaint.limit_reached')}
                        </p>
                    )}
                </div>

                {/* My Complaints */}
                <div className="card-hover flex flex-col items-center text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-status-review/10 flex items-center justify-center mb-4">
                        <FileText size={32} className="text-status-review" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">{t('dashboard.my_complaints')}</h2>
                    <p className="text-gray-400 text-sm mb-4">{t('dashboard.my_complaints_desc')}</p>
                    <button onClick={() => navigate('/complaints')} className="btn-secondary">
                        {t('dashboard.view_complaints')}
                    </button>
                </div>
            </div>

            {/* Your Information */}
            <div className="card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <User size={20} className="text-brand-orange" />
                    {t('dashboard.your_info')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">{t('profile.full_name')}</span>
                        <p className="mt-1 font-medium">{user?.fullName || '—'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">{t('profile.email')}</span>
                        <p className="mt-1 font-medium">{user?.email || '—'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">{t('profile.district')}</span>
                        <p className="mt-1 font-medium">{user?.location?.districtName || '—'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">{t('profile.mandal')}</span>
                        <p className="mt-1 font-medium">{user?.location?.mandalName || '—'}</p>
                    </div>
                </div>
                <button onClick={() => navigate('/profile')}
                    className="mt-4 text-sm text-brand-orange hover:underline">
                    {t('profile.save')} →
                </button>
            </div>
        </div>
    );
}
