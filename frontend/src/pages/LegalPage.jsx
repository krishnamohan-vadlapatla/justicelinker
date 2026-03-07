import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, FileText, AlertTriangle, Lock, ArrowLeft } from 'lucide-react';
import { legalTranslations } from '../utils/legalTranslations';

const ICONS = {
    'privacy-policy': Shield,
    'terms': FileText,
    'disclaimer': AlertTriangle,
    'data-protection': Lock
};

export default function LegalPage() {
    const { page } = useParams();
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'en';

    const pageDataFull = legalTranslations[page];
    if (!pageDataFull) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">{t('common.error') || 'Page Not Found'}</h1>
                    <Link to="/" className="text-brand-orange hover:underline">Go back home</Link>
                </div>
            </div>
        );
    }

    const pageData = pageDataFull[lang] || pageDataFull['en'];
    const Icon = ICONS[page] || FileText;

    return (
        <div className="min-h-screen bg-dark-bg">
            <header className="bg-dark-card border-b border-dark-border">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <img src="/JusticeLinker-favicon.png" alt="" className="w-6 h-6 rounded" />
                        <span className="font-bold text-sm">
                            <span className="text-navy-200">Justice</span>
                            <span className="text-brand-orange">Linker</span>
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
                <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-orange/10 to-transparent px-6 sm:px-8 py-6 border-b border-dark-border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-brand-orange/10 rounded-lg">
                                <Icon size={20} className="text-brand-orange" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white">{pageData.title}</h1>
                        </div>
                        <p className="text-xs text-gray-500">{t('common.last_updated') || 'Last updated'}: {pageData.lastUpdated}</p>
                    </div>

                    <div className="px-6 sm:px-8 py-6 space-y-6">
                        {pageData.content.map((section, i) => (
                            <div key={i}>
                                <h2 className="text-sm font-semibold text-gray-200 mb-2">{section.heading}</h2>
                                <p className="text-sm text-gray-400 leading-relaxed">{section.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-6 sm:px-8 py-4 bg-dark-hover border-t border-dark-border">
                        <p className="text-xs text-gray-500 text-center">
                            If you have questions about this {pageData.title.toLowerCase()}, contact us at{' '}
                            <a href="mailto:support@justicelinker.in" className="text-brand-orange hover:underline">support@justicelinker.in</a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
