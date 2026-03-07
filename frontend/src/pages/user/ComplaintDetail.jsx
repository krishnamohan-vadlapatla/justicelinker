import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getComplaint } from '../../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, MapPin, Tag, AlertCircle, Image as ImageIcon, CheckCircle, Clock, Activity, ThumbsUp } from 'lucide-react';

export default function ComplaintDetail() {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        getComplaint(id)
            .then(r => setComplaint(r.data))
            .catch(() => toast.error(t('common.error')))
            .finally(() => setLoading(false));
    }, [id, t]);


    if (loading) return (
        <div className="flex items-center justify-center p-16">
            <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" />
        </div>
    );

    if (!complaint) return (
        <div className="card text-center py-16">
            <AlertCircle size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Complaint not found</p>
            <button onClick={() => navigate('/complaints')} className="btn-secondary mt-4">
                <ArrowLeft size={16} className="inline mr-2" /> Back to Complaints
            </button>
        </div>
    );

    const statusColors = {
        SUBMITTED: 'badge-pending',
        UNDER_REVIEW: 'badge-review',
        VERIFIED: 'bg-cyan-500/10 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full',
        ASSIGNED: 'bg-purple-500/10 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full',
        IN_PROGRESS: 'bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full',
        RESOLVED: 'bg-green-500/10 text-green-400 text-xs font-semibold px-3 py-1 rounded-full',
        REJECTED: 'badge-rejected',
        CLOSED: 'bg-gray-500/10 text-gray-400 text-xs font-semibold px-3 py-1 rounded-full',
    };

    const priorityColors = {
        P0: 'priority-p0',
        P1: 'priority-p1',
        P2: 'priority-p2',
        P3: 'priority-p3',
    };

    return (
        <div className="max-w-3xl mx-auto fade-in">
            {/* Back button */}
            <button onClick={() => navigate('/complaints')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">{t('my_complaints.title')}</span>
            </button>

            {/* Header Card */}
            <div className="card mb-4">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-sm font-mono text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-lg">
                        {complaint.complaintId}
                    </span>
                    <span className={statusColors[complaint.status] || 'badge-pending'}>
                        {t(`status.${complaint.status}`)}
                    </span>
                    <span className={priorityColors[complaint.priority] || 'priority-p2'}>
                        {t(`priority_labels.${complaint.priority}`)}
                    </span>

                </div>

                <h1 className="text-xl sm:text-2xl font-bold mb-2">{complaint.subject}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-3">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Tag size={14} />
                        <span>{t(`issue_types.${complaint.issueType}`)}</span>
                    </div>
                    {complaint.anonymous && (
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">Anonymous</span>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="card mb-4">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                    {t('complaint.description')}
                </h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {/* Location */}
            {(complaint.stateName || complaint.districtName || complaint.mandalName || complaint.villageName) && (
                <div className="card mb-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <MapPin size={14} /> {t('location.title')}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {complaint.stateName && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">{t('location.state')}</p>
                                <p className="text-sm font-medium">{complaint.stateName}</p>
                            </div>
                        )}
                        {complaint.districtName && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">{t('location.district')}</p>
                                <p className="text-sm font-medium">{complaint.districtName}</p>
                            </div>
                        )}
                        {complaint.mandalName && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">{t('location.mandal')}</p>
                                <p className="text-sm font-medium">{complaint.mandalName}</p>
                            </div>
                        )}
                        {complaint.villageName && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">{t('location.village')}</p>
                                <p className="text-sm font-medium">{complaint.villageName}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Status Timeline */}
            {complaint.timeline && complaint.timeline.length > 0 && (
                <div className="card mb-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Activity size={14} /> {t('timeline.title')}
                    </h3>
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-dark-border" />
                        <div className="space-y-4">
                            {complaint.timeline.map((entry, i) => {
                                const isLast = i === complaint.timeline.length - 1;
                                const dotColor = entry.toStatus === 'REJECTED' ? 'bg-red-500'
                                    : entry.toStatus === 'RESOLVED' ? 'bg-green-500'
                                        : entry.toStatus === 'CLOSED' ? 'bg-gray-500'
                                            : isLast ? 'bg-brand-orange' : 'bg-gray-600';
                                return (
                                    <div key={i} className="flex gap-3 relative">
                                        <div className={`w-[22px] h-[22px] rounded-full ${dotColor} flex items-center justify-center shrink-0 z-10 ${isLast ? 'ring-2 ring-brand-orange/30' : ''}`}>
                                            <CheckCircle size={12} className="text-white" />
                                        </div>
                                        <div className="flex-1 pb-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[entry.toStatus] || 'bg-gray-700 text-gray-300'}`}>
                                                    {t(`status.${entry.toStatus}`)}
                                                </span>
                                                {entry.fromStatus && (
                                                    <span className="text-[10px] text-gray-600">{t('timeline.from')} {t(`status.${entry.fromStatus}`)}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[11px] text-gray-500">
                                                    {new Date(entry.changedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {entry.changedBy && (
                                                    <span className="text-[10px] text-gray-600">{t('timeline.by')} {entry.changedBy}</span>
                                                )}
                                            </div>
                                            {entry.remarks && (
                                                <p className="text-xs text-gray-400 mt-1">{entry.remarks}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="card mb-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <ImageIcon size={14} /> {t('complaint.evidence')} ({complaint.attachments.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {complaint.attachments.map((att, i) => (
                            <button key={i} onClick={() => setSelectedImage(att.secureUrl || att.url)}
                                className="aspect-square rounded-xl overflow-hidden border border-dark-border hover:border-brand-orange/50 transition-colors">
                                <img src={att.secureUrl || att.url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Image Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Evidence" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl" />
                </div>
            )}
        </div>
    );
}
