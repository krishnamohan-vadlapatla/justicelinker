import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api'; // Adjust path if needed
import { Activity, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';

export default function TransparencyDashboard() {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch from PublicController
        api.get('/public/transparency/stats')
            .then(res => {
                setStats(res.data);
            })
            .catch(err => console.error("Could not fetch transparency stats", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center p-16">
            <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" />
        </div>
    );

    if (!stats) return <div className="text-center p-8 text-gray-400">Unable to load dashboard data.</div>;

    const cards = [
        {
            title: t('transparency.total_complaints'),
            value: stats.totalComplaints,
            icon: <FileText size={24} className="text-blue-400" />,
            bg: "bg-blue-500/10"
        },
        {
            title: t('transparency.pending_cases'),
            value: stats.pendingComplaints,
            icon: <Clock size={24} className="text-amber-400" />,
            bg: "bg-amber-500/10"
        },
        {
            title: t('transparency.resolved_cases'),
            value: stats.resolvedComplaints,
            icon: <CheckCircle size={24} className="text-green-400" />,
            bg: "bg-green-500/10"
        },
        {
            title: t('transparency.avg_resolution_time'),
            value: `${stats.avgResolutionHours} ${t('transparency.hrs')}`,
            icon: <Activity size={24} className="text-purple-400" />,
            bg: "bg-purple-500/10"
        }
    ];

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-0 fade-in">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
                    {t('transparency.title')}
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    {t('transparency.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="card flex flex-col items-center text-center hover:-translate-y-1 transition-transform cursor-default py-6 min-h-[160px] justify-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${card.bg}`}>
                            {card.icon}
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{card.value}</h3>
                        <p className="text-[11px] sm:text-xs text-gray-400 font-semibold leading-tight">{card.title}</p>
                    </div>
                ))}
            </div>

            <div className="mt-12 card p-8 text-center bg-gradient-to-r from-brand-orange/10 to-transparent border-l-4 border-l-brand-orange">
                <AlertTriangle className="mx-auto text-brand-orange mb-4" size={32} />
                <h2 className="text-xl font-bold mb-2">{t('transparency.sla_title')}</h2>
                <p className="text-gray-300">
                    {t('transparency.sla_desc')}
                </p>
            </div>
        </div>
    );
}
