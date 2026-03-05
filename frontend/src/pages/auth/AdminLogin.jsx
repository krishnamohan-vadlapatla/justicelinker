import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminLogin } from '../../api';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please enter email and password');
            return;
        }
        setLoading(true);
        try {
            await adminLogin(email, password);
            await login();
            toast.success('Admin login successful!');
            navigate('/admin');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center gap-2">
                <img src="/JusticeLinker-favicon.png" alt="" className="w-8 h-8 rounded" />
                <span className="font-bold text-gray-400">JusticeLinker Admin Portal</span>
            </div>

            {/* Main */}
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8 fade-in">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Login</h1>
                        <p className="text-gray-400 text-sm">Please enter your credentials to proceed.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 fade-in">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2">
                            {loading ? (
                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>Login <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <button onClick={() => navigate('/login')} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                            ← User Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
