import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaint, updateComplaintStatus, updateComplaintPriority } from '../../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, MapPin, User, Shield, FileText, Image as ImageIcon, X, AlertTriangle, Activity, CheckCircle } from 'lucide-react';

const PRIORITIES = [
    { value: 'P0', label: 'P0 - Critical', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
    { value: 'P1', label: 'P1 - High', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    { value: 'P2', label: 'P2 - Medium', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    { value: 'P3', label: 'P3 - Low', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
];

const STATUSES = [
    { value: 'SUBMITTED', label: 'Submitted', color: 'bg-yellow-500/10 text-yellow-400' },
    { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-blue-500/10 text-blue-400' },
    { value: 'VERIFIED', label: 'Verified', color: 'bg-cyan-500/10 text-cyan-400' },
    { value: 'ASSIGNED', label: 'Assigned', color: 'bg-purple-500/10 text-purple-400' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-indigo-500/10 text-indigo-400' },
    { value: 'RESOLVED', label: 'Resolved', color: 'bg-green-500/10 text-green-400' },
    { value: 'REJECTED', label: 'Rejected', color: 'bg-red-500/10 text-red-400' },
    { value: 'CLOSED', label: 'Closed', color: 'bg-gray-500/10 text-gray-400' },
];

const VALID_TRANSITIONS = {
    SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
    UNDER_REVIEW: ['VERIFIED', 'REJECTED'],
    VERIFIED: ['ASSIGNED', 'REJECTED'],
    ASSIGNED: ['IN_PROGRESS', 'REJECTED'],
    IN_PROGRESS: ['RESOLVED', 'REJECTED'],
    RESOLVED: ['CLOSED', 'IN_PROGRESS'],
    REJECTED: ['UNDER_REVIEW'],
    CLOSED: [],
};

export default function AdminComplaintDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        fetchComplaint();
    }, [id]);

    const fetchComplaint = async () => {
        try {
            const res = await getComplaint(id);
            setComplaint(res.data);
        } catch (err) {
            toast.error('Failed to load complaint');
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    const handlePriorityChange = async (priority) => {
        try {
            await updateComplaintPriority(id, priority);
            toast.success(`Priority updated to ${priority}`);
            fetchComplaint();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handleStatusChange = async (toStatus) => {
        try {
            await updateComplaintStatus(id, complaint.status, toStatus);
            toast.success(`Status updated to ${toStatus.replace('_', ' ')}`);
            fetchComplaint();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-16">
            <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" />
        </div>
    );

    if (!complaint) return null;

    const currentPriority = PRIORITIES.find(p => p.value === complaint.priority);
    const currentStatus = STATUSES.find(s => s.value === complaint.status);

    return (
        <div className="space-y-6 fade-in max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin')}
                        className="p-2 rounded-lg bg-dark-input hover:bg-dark-hover transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Complaint Details</h1>
                        <p className="text-sm text-gray-400 font-mono mt-1">{complaint.complaintId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${currentPriority?.color}`}>
                        {currentPriority?.label}
                    </span>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${currentStatus?.color}`}>
                        {currentStatus?.label}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Complaint Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Subject & Info */}
                    <div className="card">
                        <h2 className="text-lg font-bold mb-4">{complaint.subject}</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <FileText size={14} />
                                <span className="font-medium">Type:</span>
                                <span className="text-gray-300">{complaint.issueType?.replace(/_/g, ' ') || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Calendar size={14} />
                                <span className="font-medium">Filed:</span>
                                <span className="text-gray-300">{new Date(complaint.createdAt).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <User size={14} />
                                <span className="font-medium">User:</span>
                                <span className="text-gray-300">{complaint.isAnonymous ? 'Anonymous' : complaint.userName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Shield size={14} />
                                <span className="font-medium">Anonymous:</span>
                                <span className="text-gray-300">{complaint.isAnonymous ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="card">
                        <h3 className="font-semibold mb-3 text-gray-300">Description</h3>
                        <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
                    </div>

                    {/* Location */}
                    <div className="card">
                        <h3 className="font-semibold mb-3 text-gray-300 flex items-center gap-2">
                            <MapPin size={16} /> Location
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {[
                                { label: 'State', value: complaint.stateName },
                                { label: 'District', value: complaint.districtName },
                                { label: 'Mandal', value: complaint.mandalName },
                                { label: 'Village', value: complaint.villageName },
                            ].map(({ label, value }) => (
                                <div key={label} className="p-3 bg-dark-input rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                                    <p className="font-medium text-gray-300">{value || 'Not specified'}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Evidence */}
                    {complaint.attachments?.length > 0 && (
                        <div className="card">
                            <h3 className="font-semibold mb-3 text-gray-300 flex items-center gap-2">
                                <ImageIcon size={16} /> Evidence ({complaint.attachments.length})
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {complaint.attachments.map((att, i) => (
                                    <img key={i} src={att.secureUrl || att.url}
                                        onClick={() => setLightbox(att.secureUrl || att.url)}
                                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-dark-border"
                                        alt={`Evidence ${i + 1}`} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status Timeline */}
                    {complaint.timeline && complaint.timeline.length > 0 && (
                        <div className="card">
                            <h3 className="font-semibold mb-4 text-gray-300 flex items-center gap-2">
                                <Activity size={16} /> Status Timeline
                            </h3>
                            <div className="relative">
                                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-dark-border" />
                                <div className="space-y-4">
                                    {complaint.timeline.map((entry, i) => {
                                        const isLast = i === complaint.timeline.length - 1;
                                        const dotColor = entry.toStatus === 'REJECTED' ? 'bg-red-500'
                                            : entry.toStatus === 'RESOLVED' ? 'bg-green-500'
                                                : entry.toStatus === 'CLOSED' ? 'bg-gray-500'
                                                    : isLast ? 'bg-brand-orange' : 'bg-gray-600';
                                        const statusObj = STATUSES.find(s => s.value === entry.toStatus);
                                        return (
                                            <div key={i} className="flex gap-3 relative">
                                                <div className={`w-[22px] h-[22px] rounded-full ${dotColor} flex items-center justify-center shrink-0 z-10 ${isLast ? 'ring-2 ring-brand-orange/30' : ''}`}>
                                                    <CheckCircle size={12} className="text-white" />
                                                </div>
                                                <div className="flex-1 pb-1">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusObj?.color || 'bg-gray-700 text-gray-300'}`}>
                                                        {statusObj?.label || entry.toStatus}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[11px] text-gray-500">
                                                            {new Date(entry.changedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {entry.changedBy && <span className="text-[10px] text-gray-600">by {entry.changedBy}</span>}
                                                    </div>
                                                    {entry.remarks && <p className="text-xs text-gray-400 mt-1">{entry.remarks}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Admin Actions */}
                <div className="space-y-6">
                    {/* Update Priority */}
                    <div className="card">
                        <h3 className="font-semibold mb-3 text-gray-300">Update Priority</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {PRIORITIES.map(p => (
                                <button key={p.value}
                                    onClick={() => handlePriorityChange(p.value)}
                                    className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${complaint.priority === p.value
                                        ? p.color + ' ring-1 ring-offset-1 ring-offset-dark-card'
                                        : 'border-dark-border text-gray-500 hover:border-gray-500'
                                        }`}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-semibold mb-3 text-gray-300">Update Status</h3>
                        <div className="space-y-2">
                            {STATUSES.filter(s => s.value !== complaint.status).map(s => (
                                <button key={s.value}
                                    onClick={() => handleStatusChange(s.value)}
                                    className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${s.color} hover:ring-1 hover:ring-offset-1 hover:ring-offset-dark-card opacity-80 hover:opacity-100`}>
                                    → {s.label}
                                </button>
                            ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-dark-border">
                            <p className="text-[10px] text-gray-600">Current: <span className={`font-semibold ${currentStatus?.color}`}>{currentStatus?.label}</span></p>
                        </div>
                    </div>

                    {/* Complaint Info Summary */}
                    <div className="card">
                        <h3 className="font-semibold mb-3 text-gray-300">Summary</h3>
                        <div className="space-y-2 text-xs text-gray-400">
                            <div className="flex justify-between py-1.5 border-b border-dark-border">
                                <span>Complaint ID</span>
                                <span className="font-mono text-brand-orange">{complaint.complaintId}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-dark-border">
                                <span>Filed On</span>
                                <span>{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-dark-border">
                                <span>Last Updated</span>
                                <span>{new Date(complaint.updatedAt || complaint.createdAt).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span>Issue Type</span>
                                <span className="text-gray-300">{complaint.issueType?.replace(/_/g, ' ')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setLightbox(null)}>
                    <button className="absolute top-6 right-6 text-white/70 hover:text-white" onClick={() => setLightbox(null)}>
                        <X size={28} />
                    </button>
                    <img src={lightbox} className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" alt="Evidence full view" />
                </div>
            )}
        </div>
    );
}
