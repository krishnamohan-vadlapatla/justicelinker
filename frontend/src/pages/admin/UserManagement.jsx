import { useState, useEffect } from 'react';
import { getAdminUsers, updateUserStatus } from '../../api';
import toast from 'react-hot-toast';
import { Users, Ban, CheckCircle, X } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Modal state for reasons
    const [modalConfig, setModalConfig] = useState(null); // { userId, status, title }
    const [reason, setReason] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getAdminUsers(page, 20);
            setUsers(res.data.users);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [page]);

    const handleStatusChangeClick = (userId, status) => {
        if (status === 'ACTIVE') {
            if (!window.confirm(`Are you sure you want to activate this user?`)) return;
            executeStatusChange(userId, status, null);
        } else {
            // Open reason modal for SUSPENDED / TERMINATED
            setModalConfig({
                userId,
                status,
                title: status === 'SUSPENDED' ? 'Suspend User' : 'Terminate User'
            });
            setReason('');
        }
    };

    const executeStatusChange = async (userId, status, actionReason) => {
        setUpdating(true);
        try {
            await updateUserStatus(userId, status, actionReason);
            toast.success(`User status updated to ${status}`);
            setModalConfig(null);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleModalSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error('Please provide a reason for this action');
            return;
        }
        executeStatusChange(modalConfig.userId, modalConfig.status, reason);
    };

    if (loading && users.length === 0) return <div className="text-center p-12 text-gray-400">Loading users...</div>;

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between shadow-brand-orange/5">
                <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="text-brand-orange" /> User Management</h1>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="text-xs text-gray-400 uppercase bg-dark-input">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">User ID</th>
                                <th className="px-4 py-3">Full Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Joined Date</th>
                                <th className="px-4 py-3 rounded-r-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-dark-hover transition-colors">
                                    <td className="px-4 py-4 font-mono text-gray-400">#{u.id}</td>
                                    <td className="px-4 py-4 font-medium text-white">{u.fullName || '—'}</td>
                                    <td className="px-4 py-4 text-gray-300">{u.email}</td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${u.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' :
                                            u.status === 'SUSPENDED' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-gray-500 mt-1">
                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {u.status === 'SUSPENDED' && (
                                                <button onClick={() => handleStatusChangeClick(u.id, 'ACTIVE')} className="px-2.5 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-medium transition-colors">
                                                    Activate
                                                </button>
                                            )}
                                            {u.status === 'TERMINATED' && (
                                                <button onClick={() => handleStatusChangeClick(u.id, 'ACTIVE')} className="px-2.5 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-medium transition-colors">
                                                    Reactivate
                                                </button>
                                            )}
                                            {u.status === 'ACTIVE' && (
                                                <>
                                                    <button onClick={() => handleStatusChangeClick(u.id, 'SUSPENDED')} className="px-2.5 py-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg text-xs font-medium transition-colors">
                                                        Suspend
                                                    </button>
                                                    <button onClick={() => handleStatusChangeClick(u.id, 'TERMINATED')} className="px-2.5 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors">
                                                        Terminate
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between border-t border-dark-border pt-4 text-sm">
                        <button onClick={() => setPage(page - 1)} disabled={page === 0} className="px-4 py-2 bg-dark-input rounded-lg disabled:opacity-50">Previous</button>
                        <span className="text-gray-400">Page {page + 1} of {totalPages}</span>
                        <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} className="px-4 py-2 bg-dark-input rounded-lg disabled:opacity-50">Next</button>
                    </div>
                )}
            </div>

            {/* Reason Modal */}
            {modalConfig && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] fade-in">
                    <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                                <Ban className={modalConfig.status === 'TERMINATED' ? 'text-red-500' : 'text-yellow-500'} size={20} />
                                {modalConfig.title}
                            </h3>
                            <button onClick={() => setModalConfig(null)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleModalSubmit}>
                            <p className="text-sm text-gray-400 mb-4">
                                Expected to provide a valid reason for this action. An email will be automatically dispatched to the user detailing this reason and the action taken.
                            </p>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Reason for action</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Misuse of platform by filing false reports repeatedly."
                                className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange mb-6 resize-none min-h-[100px]"
                                required
                            />

                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setModalConfig(null)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-400 hover:bg-dark-input transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={updating || !reason.trim()} className={`px-5 py-2.5 rounded-xl font-semibold text-white transition-colors flex items-center gap-2 ${modalConfig.status === 'TERMINATED' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
                                    } disabled:opacity-50`}>
                                    {updating ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : 'Confirm Action'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
