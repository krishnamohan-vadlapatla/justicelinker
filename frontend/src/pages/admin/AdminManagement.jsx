import { useState, useEffect } from 'react';
import { getAdminList, createAdmin, deleteAdmin } from '../../api';
import toast from 'react-hot-toast';
import { UserPlus, Trash2, Shield, ShieldCheck, Search, X } from 'lucide-react';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ fullName: '', email: '', password: '', department: '' });

    const fetchAdmins = async () => {
        try {
            const res = await getAdminList();
            setAdmins(res.data.admins || []);
        } catch (err) {
            if (err.response?.status === 403) {
                toast.error('Only Super Admin can access this page');
            } else {
                toast.error('Failed to load admins');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdmins(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.fullName || !form.email || !form.password || !form.department) {
            toast.error('All fields are required');
            return;
        }

        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!*-]).{8,}$/;
        if (!passwordRegex.test(form.password)) {
            toast.error('Password must be 8+ chars and contain at least 1 number, 1 uppercase, 1 lowercase, and 1 special char');
            return;
        }

        setCreating(true);
        try {
            await createAdmin(form);
            toast.success('Admin created successfully!');
            setForm({ fullName: '', email: '', password: '', department: '' });
            setShowForm(false);
            fetchAdmins();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create admin');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (adminId, adminName) => {
        if (!window.confirm(`Are you sure you want to remove "${adminName}" as an admin?`)) return;
        try {
            await deleteAdmin(adminId);
            toast.success('Admin removed successfully');
            fetchAdmins();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete admin');
        }
    };

    const filtered = admins.filter(a =>
        a.fullName.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        (a.department && a.department.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Manage Admins</h1>
                    <p className="text-gray-400 text-sm mt-1">Create and manage admin officials for your platform</p>
                </div>
                <button onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center gap-2 w-fit">
                    {showForm ? <><X size={18} /> Cancel</> : <><UserPlus size={18} /> Add New Admin</>}
                </button>
            </div>

            {/* Create Admin Form */}
            {showForm && (
                <div className="card fade-in">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <UserPlus size={20} className="text-brand-orange" />
                        Create New Admin
                    </h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={form.fullName}
                                onChange={e => setForm({ ...form, fullName: e.target.value })}
                                placeholder="Enter full name"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Department / Role</label>
                            <select
                                value={form.department}
                                onChange={e => setForm({ ...form, department: e.target.value })}
                                className="input-field"
                            >
                                <option value="" disabled>Select department</option>
                                <option value="Police">Police Department</option>
                                <option value="Judicial">Judicial / Legal</option>
                                <option value="Municipality">Municipality / Panchayat</option>
                                <option value="Revenue">Revenue Department</option>
                                <option value="Political">Political / Elected</option>
                                <option value="General Admin">General Admin</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="e.g. officer@justicelinker.in"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                placeholder="Enter a strong password"
                                className="input-field"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">8+ chars, 1Up, 1Low, 1Num, 1Spec (e.g., Justice@123)</p>
                        </div>
                        <div className="sm:col-span-1 md:sm:col-span-2 lg:sm:col-span-4">
                            <button type="submit" disabled={creating}
                                className="btn-primary flex items-center gap-2">
                                {creating ? (
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <><UserPlus size={18} /> Create Admin</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search admins by name, email, or department..."
                    className="input-field pl-10"
                />
            </div>

            {/* Admin List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="card text-center py-10">
                        <Shield size={40} className="mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-400">No admins found</p>
                    </div>
                ) : (
                    filtered.map(admin => (
                        <div key={admin.id} className="card-hover flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${admin.role === 'SUPER_ADMIN'
                                    ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                                    : 'bg-gradient-to-br from-brand-orange to-navy-400'
                                    }`}>
                                    {admin.fullName?.[0] || 'A'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{admin.fullName}</span>
                                        {admin.role === 'SUPER_ADMIN' ? (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase">
                                                <ShieldCheck size={10} /> Super Admin
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">
                                                <Shield size={10} /> Admin
                                            </span>
                                        )}
                                        {admin.department && admin.department !== 'General' && (
                                            <span className="px-2 py-0.5 rounded-full bg-dark-input text-gray-300 text-[10px] font-semibold border border-dark-border">
                                                {admin.department}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">{admin.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {admin.role !== 'SUPER_ADMIN' && (
                                    <button
                                        onClick={() => handleDelete(admin.id, admin.fullName)}
                                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                        title="Remove admin"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Stats */}
            <div className="text-center text-xs text-gray-500 mt-4">
                Total: {admins.length} admin{admins.length !== 1 ? 's' : ''} •
                Super Admins: {admins.filter(a => a.role === 'SUPER_ADMIN').length} •
                Admins: {admins.filter(a => a.role === 'ADMIN').length}
            </div>
        </div>
    );
}
