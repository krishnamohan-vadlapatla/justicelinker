import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, getStates, getDistricts, getMandals, getVillages } from '../../api';
import toast from 'react-hot-toast';
import { User, Mail, Save } from 'lucide-react';

export default function Profile() {
    const { t } = useTranslation();
    const { user, fetchUser } = useAuth();

    const [form, setForm] = useState({ fullName: '', stateId: '', districtId: '', mandalId: '', villageId: '' });
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        if (user) {
            setForm({
                fullName: user.fullName || '',
                stateId: user.location?.stateId || '',
                districtId: user.location?.districtId || '',
                mandalId: user.location?.mandalId || '',
                villageId: user.location?.villageId || '',
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.fullName.trim()) {
            toast.error(t('profile.name_required') || 'Full Name is required');
            return;
        }
        if (!form.stateId || !form.districtId || !form.mandalId || !form.villageId) {
            toast.error(t('profile.location_required') || 'Please complete your location details');
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                fullName: form.fullName,
                stateId: form.stateId || null,
                districtId: form.districtId || null,
                mandalId: form.mandalId || null,
                villageId: form.villageId || null,
            });
            await fetchUser();
            toast.success(t('common.success'));
        } catch (err) {
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto fade-in">
            <h1 className="text-2xl font-bold mb-6">{t('nav.profile')}</h1>

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.email')}</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input type="email" value={user?.email || ''} disabled className="input-field pl-10 opacity-50 cursor-not-allowed" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.full_name')}</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                            placeholder={t('profile.full_name_placeholder')} className="input-field pl-10" />
                    </div>
                </div>

                <div className="pt-4 border-t border-dark-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.state')}</label>
                        <select value={form.stateId} onChange={e => setForm({ ...form, stateId: e.target.value, districtId: '', mandalId: '', villageId: '' })} className="select-field">
                            <option value="">{t('profile.select_state')}</option>
                            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.district')}</label>
                        <select value={form.districtId} onChange={e => setForm({ ...form, districtId: e.target.value, mandalId: '', villageId: '' })} className="select-field">
                            <option value="">{t('profile.select_district')}</option>
                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.mandal')}</label>
                        <select value={form.mandalId} onChange={e => setForm({ ...form, mandalId: e.target.value, villageId: '' })} className="select-field">
                            <option value="">{t('profile.select_mandal')}</option>
                            {mandals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.village')}</label>
                        <select value={form.villageId} onChange={e => setForm({ ...form, villageId: e.target.value })} className="select-field">
                            <option value="">{t('profile.select_village')}</option>
                            {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <><Save size={18} /> {t('profile.save')}</>}
                </button>
            </form>
        </div>
    );
}
