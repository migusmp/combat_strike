'use client';
import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { API_URL } from '../utils/api_url';
import { AuthUser } from '../interfaces/user';

interface AuthContextType {
    isAuthenticated: boolean;
    checkingAuth: boolean;
    user: AuthUser | null;
    setAuthenticated: (val: boolean) => void;
    setUser: Dispatch<SetStateAction<AuthUser | null>>;
    refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    checkingAuth: true,
    user: null,
    setAuthenticated: () => { },
    setUser: () => { },
    refreshUser: async () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
    const [user, setUser] = useState<AuthUser | null>(null);

    const setAuthenticated = (value: boolean) => {
        setIsAuthenticated(value);
        if (!value) {
            setUser(null);
        }
    };

    const fetchUserProfile = async (): Promise<AuthUser> => {
        const response = await fetch(`${API_URL}/users/me`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener el usuario');
        }

        const data: AuthUser = await response.json();
        setUser(data);
        return data;
    };

    const refreshUser = async () => {
        try {
            return await fetchUserProfile();
        } catch (error) {
            setUser(null);
            throw error;
        }
    };

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch(`${API_URL}/auth/validate`, {
                    credentials: 'include',
                });

                if (!res.ok) {
                    throw new Error('Sesión inválida');
                }

                await fetchUserProfile();
                setAuthenticated(true);
            } catch {
                setAuthenticated(false);
            } finally {
                setCheckingAuth(false);
            }
        }

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, checkingAuth, user, setUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
