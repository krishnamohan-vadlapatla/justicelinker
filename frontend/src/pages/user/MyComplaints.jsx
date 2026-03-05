import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyComplaints } from '../../api';
import { FileText, Eye, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyComplaints() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyComplaints(0, 50)
            .then(r => setComplaints(r.data.complaints))
            .catch(() => toast.error(t('common.error')))
            .finally(() => setLoading(false));
    }, [t]);

    if (loading) return <div className="text-center p-12 text-gray-400">{t('my_complaints.loading')}</div>;

    return (
        <div className="fade-in">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{t('my_complaints.title')}</h1>
            </div>

            {complaints.length === 0 ? (
                <div className="card text-center py-16">
                    <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">{t('my_complaints.no_complaints')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {complaints.map(c => (
                        <div key={c.id} className="card-hover cursor-pointer" onClick={() => navigate(`/complaints/${c.complaintId}`)}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-mono text-brand-orange">{c.complaintId}</span>
                                        <span className={`badge-sm ${c.priority === 'P0' ? 'priority-p0' :
                                            c.priority === 'P1' ? 'priority-p1' :
                                                c.priority === 'P2' ? 'priority-p2' : 'priority-p3'
                                            }`}>
                                            {t(`priority_labels.${c.priority}`)}
                                        </span>
                                        <span className={`badge-sm ${c.status === 'SUBMITTED' ? 'badge-pending' :
                                            c.status === 'IN_REVIEW' ? 'badge-review' :
                                                c.status === 'VERIFIED' ? 'badge-verified' : 'badge-rejected'
                                            }`}>
                                            {t(`status.${c.status}`)}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-lg">{c.subject}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2 mt-1">{c.description}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); navigate(`/complaints/${c.complaintId}`); }}
                                    className="btn-secondary whitespace-nowrap flex items-center gap-2 justify-center sm:w-auto w-full">
                                    <Eye size={16} /> {t('my_complaints.view')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
