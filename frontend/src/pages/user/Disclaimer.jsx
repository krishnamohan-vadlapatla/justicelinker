import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
    const { t } = useTranslation();

    return (
        <div className="max-w-3xl mx-auto fade-in">
            <div className="card border-brand-orange/30 shadow-lg shadow-brand-orange/5 p-8">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                        <AlertTriangle size={32} className="text-orange-500" />
                    </div>
                    <h1 className="text-2xl font-bold">{t('disclaimer.title')}</h1>
                    <p className="text-gray-400 mt-2">{t('disclaimer.warning')}</p>
                </div>

                <div className="space-y-4 text-gray-300 bg-dark-input p-6 rounded-xl border border-dark-border">
                    {['point1', 'point2', 'point3', 'point4', 'point5'].map(k => (
                        <div key={k} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-orange mt-2 shrink-0" />
                            <p className="leading-relaxed">{t(`disclaimer.${k}`)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
