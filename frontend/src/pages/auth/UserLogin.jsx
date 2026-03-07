import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { sendOtp, verifyOtp } from '../../api';
import toast from 'react-hot-toast';
import { Mail, Shield, ArrowRight } from 'lucide-react';

export default function UserLogin() {
    const { t, i18n } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const otpRefs = useRef([]);

    const changeLang = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('lang', lng);
    };

    const handleSendOtp = async () => {
        if (!email || !email.includes('@')) {
            toast.error('Please enter a valid email');
            return;
        }
        setLoading(true);
        try {
            await sendOtp(email);
            setOtpSent(true);
            toast.success(t('login.otp_sent'));
        } catch (err) {
            toast.error(err.response?.data?.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value[value.length - 1];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (paste.length === 6) {
            setOtp(paste.split(''));
            otpRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpStr = otp.join('');
        if (otpStr.length !== 6) {
            toast.error('Please enter complete OTP');
            return;
        }
        setLoading(true);
        try {
            await verifyOtp(email, otpStr);
            await login();
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/JusticeLinker-favicon.png" alt="JusticeLinker" className="w-8 h-8 rounded" />
                    <span className="font-bold">
                        <span className="text-navy-200">Justice</span>
                        <span className="text-brand-orange">Linker</span>
                    </span>
                </div>
                {/* Language Switcher */}
                <div className="flex items-center gap-1 bg-dark-input rounded-lg p-1">
                    <button onClick={() => changeLang('en')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${i18n.language === 'en' ? 'bg-brand-orange text-white' : 'text-gray-400'}`}>
                        EN
                    </button>
                    <button onClick={() => changeLang('te')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all font-telugu ${i18n.language === 'te' ? 'bg-brand-orange text-white' : 'text-gray-400'}`}>
                        తె
                    </button>
                    <button onClick={() => changeLang('hi')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${i18n.language === 'hi' ? 'bg-brand-orange text-white' : 'text-gray-400'}`}>
                        हि
                    </button>
                </div>
            </div>

            {/* Main */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    {/* Logo & Title */}
                    <div className="flex flex-col items-center text-center mb-8 fade-in">
                        <img src="/JusticeLinker-favicon.png" alt="JusticeLinker" className="w-16 h-16 mb-5 object-contain" />
                        <h1 className="text-2xl sm:text-3xl font-bold mb-3">{t('login.title')}</h1>
                        <p className="text-gray-400 text-sm mb-3 max-w-sm">{t('login.subtitle')}</p>
                        <p className="inline-block px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-medium tracking-wide">
                            {t('tagline')}
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="glass-card p-6 sm:p-8 fade-in">
                        {/* Email Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('login.email_label')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('login.email_placeholder')}
                                    className="input-field pl-10"
                                    disabled={otpSent}
                                />
                            </div>
                        </div>

                        {/* Get OTP Button */}
                        {!otpSent && (
                            <button onClick={handleSendOtp} disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-2">
                                {loading ? (
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <>{t('login.get_otp')} <ArrowRight size={18} /></>
                                )}
                            </button>
                        )}

                        {/* OTP Input */}
                        {otpSent && (
                            <div className="mt-6 fade-in">
                                <p className="text-center text-sm text-gray-400 mb-4">
                                    <Shield size={16} className="inline mr-1 text-brand-orange" />
                                    {t('login.otp_title')}
                                </p>
                                <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handleOtpPaste}>
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => (otpRefs.current[i] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className="otp-input"
                                        />
                                    ))}
                                </div>
                                <button onClick={handleVerify} disabled={loading}
                                    className="btn-primary w-full flex items-center justify-center gap-2">
                                    {loading ? (
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <>{t('login.verify')} <ArrowRight size={18} /></>
                                    )}
                                </button>
                                <button onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                                    className="w-full text-center text-sm text-brand-orange mt-3 hover:underline">
                                    {t('login.resend')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-500 mt-6">
                        {t('login.terms')}{' '}
                        <span onClick={() => navigate('/legal/terms')} className="text-brand-orange cursor-pointer hover:underline">{t('login.terms_link')}</span>
                        {' & '}
                        <span onClick={() => navigate('/legal/privacy-policy')} className="text-brand-orange cursor-pointer hover:underline">{t('login.privacy_link')}</span>
                    </p>
                    <div className="text-center mt-4">
                        <button onClick={() => navigate('/admin/login')} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                            {t('login.admin_login')} →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
