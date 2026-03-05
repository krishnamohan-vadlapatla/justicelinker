import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logout as apiLogout } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await getMe();
            setUser(res.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUser(); }, []);

    const login = async () => {
        await fetchUser();
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch { }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
