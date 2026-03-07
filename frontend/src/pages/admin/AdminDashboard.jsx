import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getAdminComplaints, updateComplaintStatus, updateComplaintPriority, getStates, getDistricts, getMandals, getVillages } from '../../api';
import toast from 'react-hot-toast';
import { FileText, CheckCircle, Clock, XCircle, AlertTriangle, Eye, RefreshCw, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    // Filter state
    const [filters, setFilters] = useState({
        stateId: '', districtId: '', mandalId: '', villageId: '',
        priority: '', status: ''
    });
    const [appliedFilters, setAppliedFilters] = useState({});
    const [showFilters, setShowFilters] = useState(false);

    // Location dropdowns
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [villages, setVillages] = useState([]);

    // Load states on mount
    useEffect(() => { getStates().then(r => setStates(r.data)).catch(() => { }); }, []);

    // Cascading location filters
    useEffect(() => {
        if (filters.stateId) getDistricts(filters.stateId).then(r => setDistricts(r.data)).catch(() => { });
        else { setDistricts([]); setFilters(f => ({ ...f, districtId: '', mandalId: '', villageId: '' })); }
    }, [filters.stateId]);

    useEffect(() => {
        if (filters.districtId) getMandals(filters.districtId).then(r => setMandals(r.data)).catch(() => { });
        else { setMandals([]); setFilters(f => ({ ...f, mandalId: '', villageId: '' })); }
    }, [filters.districtId]);

    useEffect(() => {
        if (filters.mandalId) getVillages(filters.mandalId).then(r => setVillages(r.data)).catch(() => { });
        else setVillages([]);
    }, [filters.mandalId]);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            // Build params - only send non-empty filters
            const params = { page, size: pageSize };
            Object.entries(appliedFilters).forEach(([k, v]) => { if (v) params[k] = v; });

            const [sRes, cRes] = await Promise.all([
                getDashboardStats(),
                getAdminComplaints(params)
            ]);
            setStats(sRes.data);
            setComplaints(cRes.data.complaints || []);
            setTotalPages(cRes.data.totalPages || 1);
            setTotalElements(cRes.data.totalElements || 0);
        } catch (err) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, [page, appliedFilters]);

    const applyFilters = () => {
        setAppliedFilters({ ...filters });
        setPage(0);
    };

    const clearFilters = () => {
        const empty = { stateId: '', districtId: '', mandalId: '', villageId: '', priority: '', status: '' };
        setFilters(empty);
        setAppliedFilters({});
        setPage(0);
    };

    const handleStatusChange = async (id, current, to) => {
        try {
            await updateComplaintStatus(id, current, to);
            toast.success('Status updated');
            fetchDashboard();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handlePriorityChange = async (id, priority) => {
        try {
            await updateComplaintPriority(id, priority);
            toast.success('Priority updated');
            fetchDashboard();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const startItem = page * pageSize + 1;
    const endItem = Math.min((page + 1) * pageSize, totalElements);

    // Pagination range
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(0, page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible);
        if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
        for (let i = start; i < end; i++) pages.push(i);
        return pages;
    };

    const StatCard = ({ title, value, icon: Icon, colorClass }) => (
        <div className="card-hover flex items-center justify-between p-5">
            <div>
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <p className="text-3xl font-bold mt-1">{value || 0}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                <Icon size={24} />
            </div>
        </div>
    );

    if (loading && !stats) return (
        <div className="flex items-center justify-center p-16">
            <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <button onClick={fetchDashboard} className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm">
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total" value={stats?.totalComplaints} icon={FileText} colorClass="bg-gray-500/10 text-gray-400" />
                <StatCard title="Submitted" value={stats?.submitted} icon={AlertTriangle} colorClass="bg-yellow-500/10 text-yellow-500" />
                <StatCard title="Under Review" value={stats?.underReview} icon={Clock} colorClass="bg-blue-500/10 text-blue-500" />
                <StatCard title="Resolved" value={(stats?.resolved || 0) + (stats?.closed || 0)} icon={CheckCircle} colorClass="bg-green-500/10 text-green-500" />
            </div>

            {/* All Complaints Section */}
            <div className="card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                    <h2 className="text-xl font-bold">All Complaints</h2>
                    <button onClick={() => setShowFilters(!showFilters)}
                        className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm">
                        <Filter size={16} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>

                {/* Filter Bar */}
                {showFilters && (
                    <div className="p-4 bg-dark-input rounded-xl border border-dark-border mb-5">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                            {/* State */}
                            <select value={filters.stateId}
                                onChange={e => setFilters({ ...filters, stateId: e.target.value, districtId: '', mandalId: '', villageId: '' })}
                                className="select-field py-2 text-sm">
                                <option value="">All States</option>
                                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {/* District */}
                            <select value={filters.districtId}
                                onChange={e => setFilters({ ...filters, districtId: e.target.value, mandalId: '', villageId: '' })}
                                className="select-field py-2 text-sm" disabled={!filters.stateId}>
                                <option value="">All Districts</option>
                                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            {/* Mandal */}
                            <select value={filters.mandalId}
                                onChange={e => setFilters({ ...filters, mandalId: e.target.value, villageId: '' })}
                                className="select-field py-2 text-sm" disabled={!filters.districtId}>
                                <option value="">All Mandals</option>
                                {mandals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            {/* Village */}
                            <select value={filters.villageId}
                                onChange={e => setFilters({ ...filters, villageId: e.target.value })}
                                className="select-field py-2 text-sm" disabled={!filters.mandalId}>
                                <option value="">All Villages</option>
                                {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                            {/* Priority */}
                            <select value={filters.priority}
                                onChange={e => setFilters({ ...filters, priority: e.target.value })}
                                className="select-field py-2 text-sm">
                                <option value="">All Priorities</option>
                                {PRIORITIES.map(p => <option key={p} value={p}>{p === 'P0' ? 'P0 - Critical' : p === 'P1' ? 'P1 - High' : p === 'P2' ? 'P2 - Medium' : 'P3 - Low'}</option>)}
                            </select>
                            {/* Status */}
                            <select value={filters.status}
                                onChange={e => setFilters({ ...filters, status: e.target.value })}
                                className="select-field py-2 text-sm">
                                <option value="">All Statuses</option>
                                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={applyFilters}
                                className="btn-primary px-5 py-2 text-sm flex items-center gap-2">
                                <Search size={14} /> Apply Filters
                            </button>
                            <button onClick={clearFilters}
                                className="btn-secondary px-4 py-2 text-sm">
                                Clear All
                            </button>
                        </div>
                    </div>
                )}

                {/* Results Count */}
                {totalElements > 0 && (
                    <p className="text-sm text-gray-400 mb-4">
                        Showing <span className="text-white font-medium">{startItem}</span> to <span className="text-white font-medium">{endItem}</span> of <span className="text-white font-medium">{totalElements}</span> results
                    </p>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="text-xs text-gray-400 uppercase bg-dark-input">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Complaint ID</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 rounded-r-lg text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {complaints.map(c => (
                                <tr key={c.id} className="hover:bg-dark-hover transition-colors">
                                    <td className="px-4 py-4">
                                        <p className="font-mono text-brand-orange text-xs">{c.complaintId}</p>
                                    </td>
                                    <td className="px-4 py-4 text-xs text-gray-400">
                                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-xs text-gray-300 truncate max-w-[180px]">
                                            {[c.districtName, c.mandalName, c.villageName].filter(Boolean).join(', ') || 'Not specified'}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${c.priority === 'P0' ? 'bg-red-500/10 text-red-500' :
                                            c.priority === 'P1' ? 'bg-orange-500/10 text-orange-500' :
                                                c.priority === 'P2' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-green-500/10 text-green-500'
                                            }`}>
                                            {c.priority === 'P0' ? 'P0 Critical' : c.priority === 'P1' ? 'P1 High' : c.priority === 'P2' ? 'P2 Medium' : 'P3 Low'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="inline-flex items-center px-2 py-1 bg-dark-input border border-dark-border rounded text-xs text-gray-300">
                                            {c.status.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <button onClick={() => navigate(`/admin/complaints/${c.complaintId}`)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-orange bg-brand-orange/10 rounded-lg hover:bg-brand-orange/20 transition-colors">
                                            <Eye size={14} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {complaints.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                                        <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                        No complaints found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between border-t border-dark-border pt-4">
                        <p className="text-sm text-gray-500">
                            Page {page + 1} of {totalPages}
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                className="p-2 rounded-lg bg-dark-input disabled:opacity-30 hover:bg-dark-hover transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            {getPageNumbers().map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-brand-orange text-white' : 'bg-dark-input text-gray-400 hover:text-white hover:bg-dark-hover'
                                        }`}>
                                    {p + 1}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                                className="p-2 rounded-lg bg-dark-input disabled:opacity-30 hover:bg-dark-hover transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
