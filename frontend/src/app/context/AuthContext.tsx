'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '../utils/api_url';

interface AuthContextType {
    isAuthenticated: boolean;
    checkingAuth: boolean;
    setAuthenticated: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    checkingAuth: true,
    setAuthenticated: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
    const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch(`${API_URL}/auth/validate`, {
                    credentials: 'include',
                });
                setAuthenticated(res.ok);
            } catch {
                setAuthenticated(false);
            } finally {
                setCheckingAuth(false);
            }
        }

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, checkingAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
