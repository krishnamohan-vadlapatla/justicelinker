import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { createComplaint, uploadImage, getStates, getDistricts, getMandals, getVillages } from '../../api';
import toast from 'react-hot-toast';
import { Upload, Send, X, Image as ImageIcon, AlertTriangle, ShieldCheck } from 'lucide-react';

const ISSUE_TYPES = ['POLICE_MISCONDUCT', 'GOVT_MISCONDUCT', 'CORRUPTION_BRIBERY', 'POLITICAL_HARASSMENT', 'LAND_PROPERTY_DISPUTE', 'EXTORTION_THREATS', 'LEGAL_DISPUTE', 'CIVIC_ISSUES', 'MUNICIPALITY_PANCHAYAT', 'OTHER'];


export default function CreateComplaint() {
    const { t } = useTranslation();
    const { user, fetchUser } = useAuth();
    const navigate = useNavigate();

    const [isAnonymous, setIsAnonymous] = useState(false);
    const [form, setForm] = useState({
        issueType: '', otherTypeText: '', subject: '', description: '',
        stateId: '', districtId: '', mandalId: '', villageId: '',
    });
    const [images, setImages] = useState([]);
    const [uploadedUrls, setUploadedUrls] = useState([]);

    const [truthfulness, setTruthfulness] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(localStorage.getItem('disclaimerAccepted') === 'true');

    // Location dropdowns
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [villages, setVillages] = useState([]);

    useEffect(() => { getStates().then(r => setStates(r.data)).catch(() => { }); }, []);

    useEffect(() => {
        if (form.stateId) getDistricts(form.stateId).then(r => setDistricts(r.data)).catch(() => { });
        else setDistricts([]);
    }, [form.stateId]);

    useEffect(() => {
        if (form.districtId) getMandals(form.districtId).then(r => setMandals(r.data)).catch(() => { });
        else setMandals([]);
    }, [form.districtId]);

    useEffect(() => {
        if (form.mandalId) getVillages(form.mandalId).then(r => setVillages(r.data)).catch(() => { });
        else setVillages([]);
    }, [form.mandalId]);

    // Pre-fill from profile
    useEffect(() => {
        if (!isAnonymous && user?.location) {
            setForm(f => ({
                ...f,
                stateId: user.location.stateId || '',
                districtId: user.location.districtId || '',
                mandalId: user.location.mandalId || '',
                villageId: user.location.villageId || '',
            }));
        }
    }, [isAnonymous, user]);

    if (!disclaimerAccepted) {
        return (
            <div className="max-w-lg mx-auto fade-in">
                <div className="card text-center p-8">
                    <AlertTriangle size={48} className="mx-auto text-status-pending mb-4" />
                    <h2 className="text-xl font-bold mb-4">{t('disclaimer.title')}</h2>
                    <p className="text-gray-400 text-sm mb-6">{t('disclaimer.warning')}</p>
                    <ul className="text-left text-sm space-y-3 mb-6">
                        {['point1', 'point2', 'point3', 'point4', 'point5'].map(k => (
                            <li key={k} className="flex items-start gap-2 text-gray-300">
                                <span className="text-brand-orange mt-1">•</span>
                                {t(`disclaimer.${k}`)}
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => { setDisclaimerAccepted(true); localStorage.setItem('disclaimerAccepted', 'true'); toast.success(t('disclaimer.accept')); }}
                        className="btn-primary w-full mb-3">{t('disclaimer.accept')}</button>
                    <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full">{t('disclaimer.decline')}</button>
                </div>
            </div>
        );
    }

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 3) { toast.error('Maximum 3 images allowed'); return; }
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} exceeds 5MB`); return; }
            if (!file.type.startsWith('image/')) { toast.error(`${file.name} is not an image`); return; }
        }
        setUploading(true);
        try {
            for (const file of files) {
                const res = await uploadImage(file);
                setUploadedUrls(prev => [...prev, res.data.secure_url]);
                setImages(prev => [...prev, { name: file.name, preview: URL.createObjectURL(file) }]);
                toast.success(`${file.name} uploaded`);
            }
        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (idx) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
        setUploadedUrls(prev => prev.filter((_, i) => i !== idx));
    };



    const handleSubmit = async () => {
        if (!form.issueType) { toast.error('Select issue type'); return; }
        if (!form.subject) { toast.error('Enter subject'); return; }
        if (!form.description) { toast.error('Enter description'); return; }
        if (!truthfulness) { toast.error('Please confirm your complaint is truthful'); return; }


        setLoading(true);
        try {
            await createComplaint({
                isAnonymous,
                issueType: form.issueType,
                otherTypeText: form.otherTypeText,
                subject: form.subject,
                priority: 'P2',
                description: form.description,
                attachmentUrls: uploadedUrls,
                stateId: form.stateId || null,
                districtId: form.districtId || null,
                mandalId: form.mandalId || null,
                villageId: form.villageId || null,
                latitude: null,
                longitude: null,
            });
            toast.success(t('complaint.success'));
            await fetchUser();
            navigate('/complaints');
        } catch (err) {
            toast.error(err.response?.data?.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto fade-in">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">{t('complaint.create_title')}</h1>
                <p className="text-gray-400 text-sm mt-1">{t('complaint.create_subtitle')}</p>
            </div>

            <div className="card space-y-5">
                {/* Anonymous Toggle */}
                <div className="flex items-center gap-4 p-3 bg-dark-input rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input type="radio" checked={isAnonymous} onChange={() => setIsAnonymous(true)}
                            className="accent-brand-orange" />
                        <span className="text-sm font-medium">{t('complaint.anonymous')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input type="radio" checked={!isAnonymous} onChange={() => setIsAnonymous(false)}
                            className="accent-brand-orange" />
                        <span className="text-sm font-medium">{t('complaint.use_profile')}</span>
                    </label>
                </div>

                {/* Address */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">{t('complaint.address_title')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select value={form.stateId} onChange={e => setForm({ ...form, stateId: e.target.value, districtId: '', mandalId: '', villageId: '' })} className="select-field">
                            <option value="">{t('profile.select_state')}</option>
                            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select value={form.districtId} onChange={e => setForm({ ...form, districtId: e.target.value, mandalId: '', villageId: '' })} className="select-field">
                            <option value="">{t('profile.select_district')}</option>
                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <select value={form.mandalId} onChange={e => setForm({ ...form, mandalId: e.target.value, villageId: '' })} className="select-field">
                            <option value="">{t('profile.select_mandal')}</option>
                            {mandals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <select value={form.villageId} onChange={e => setForm({ ...form, villageId: e.target.value })} className="select-field">
                            <option value="">{t('profile.select_village')}</option>
                            {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Issue Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('complaint.issue_type')}</label>
                    <select value={form.issueType} onChange={e => setForm({ ...form, issueType: e.target.value })} className="select-field">
                        <option value="">{t('complaint.select_type')}</option>
                        {ISSUE_TYPES.map(type => <option key={type} value={type}>{t(`issue_types.${type}`)}</option>)}
                    </select>
                    {form.issueType === 'OTHER' && (
                        <input value={form.otherTypeText} onChange={e => setForm({ ...form, otherTypeText: e.target.value })}
                            placeholder="Specify the issue type" className="input-field mt-2" />
                    )}
                </div>

                {/* Subject */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('complaint.subject')}</label>
                    <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                        placeholder={t('complaint.subject_placeholder')} className="input-field" maxLength={200} />
                </div>



                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('complaint.description')} <span className="text-gray-500">({t('complaint.max_chars')})</span>
                    </label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value.slice(0, 1000) })}
                        placeholder={t('complaint.description_placeholder')}
                        rows={4} className="input-field resize-none" />
                    <p className="text-xs text-gray-500 mt-1 text-right">{form.description.length}/1000</p>
                </div>

                {/* Evidence Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('complaint.evidence')} <span className="text-yellow-400 text-xs">⭐ {t('complaint.evidence_recommended')}</span></label>
                    <p className="text-xs text-gray-500 mb-2">{t('complaint.evidence_helper')}</p>
                    {images.length < 3 && (
                        <label className="block border-2 border-dashed border-dark-border rounded-xl p-6 text-center cursor-pointer hover:border-brand-orange/50 transition-colors">
                            <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                            {uploading ? (
                                <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full mx-auto" />
                            ) : (
                                <>
                                    <ImageIcon size={32} className="mx-auto text-gray-500 mb-2" />
                                    <span className="text-sm text-brand-orange">{t('complaint.upload')}</span>
                                    <span className="text-sm text-gray-500"> {t('complaint.drag_drop')}</span>
                                </>
                            )}
                        </label>
                    )}
                    {images.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                            {images.map((img, i) => (
                                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                    <button onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>



                {/* Platform Disclaimer Note */}
                <div className="p-3 bg-dark-input rounded-xl border border-dark-border">
                    <div className="flex items-start gap-2">
                        <ShieldCheck size={16} className="text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-400 leading-relaxed">{t('complaint.platform_note')}</p>
                    </div>
                </div>

                {/* Truthfulness Confirmation */}
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-dark-input rounded-xl border border-dark-border hover:border-brand-orange/30 transition-colors">
                    <input type="checkbox" checked={truthfulness} onChange={e => setTruthfulness(e.target.checked)}
                        className="mt-0.5 accent-brand-orange w-4 h-4 shrink-0" />
                    <span className="text-sm text-gray-300 leading-relaxed">{t('complaint.truthfulness')}</span>
                </label>

                {/* Submit */}
                <button onClick={handleSubmit} disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-lg">
                    {loading ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                        <><Send size={20} /> {t('complaint.submit')}</>
                    )}
                </button>
            </div>
        </div>
    );
}
