'use client';
import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';
import { API_URL } from '../utils/api_url';
import { AuthUser } from '../interfaces/user';
import { PurchasedCourse } from '../interfaces/purchases';

interface AuthContextType {
    isAuthenticated: boolean;
    checkingAuth: boolean;
    user: AuthUser | null;
    setAuthenticated: (val: boolean) => void;
    setUser: Dispatch<SetStateAction<AuthUser | null>>;
    refreshUser: () => Promise<AuthUser | null>;
    purchasedCourses: PurchasedCourse[] | null;
    purchasedCoursesLoading: boolean;
    purchasedCoursesError: string | null;
    refreshPurchasedCourses: () => Promise<PurchasedCourse[] | null>;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    checkingAuth: true,
    user: null,
    setAuthenticated: () => { },
    setUser: () => { },
    refreshUser: async () => null,
    purchasedCourses: null,
    purchasedCoursesLoading: false,
    purchasedCoursesError: null,
    refreshPurchasedCourses: async () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[] | null>(null);
    const [purchasedCoursesLoading, setPurchasedCoursesLoading] = useState<boolean>(false);
    const [purchasedCoursesError, setPurchasedCoursesError] = useState<string | null>(null);

    const setAuthenticated = (value: boolean) => {
        setIsAuthenticated(value);
        if (!value) {
            setUser(null);
            setPurchasedCourses(null);
            setPurchasedCoursesError(null);
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

    const refreshPurchasedCourses = useCallback(async () => {
        if (!isAuthenticated) {
            setPurchasedCourses(null);
            return null;
        }

        setPurchasedCoursesLoading(true);
        setPurchasedCoursesError(null);

        try {
            const response = await fetch(`${API_URL}/users/me/courses`, {
                credentials: 'include',
                cache: 'no-store',
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    setPurchasedCourses([]);
                    return [];
                }
                throw new Error('No se pudieron cargar tus cursos');
            }

            const data: PurchasedCourse[] = await response.json();
            setPurchasedCourses(data);
            return data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error inesperado';
            setPurchasedCoursesError(message);
            setPurchasedCourses([]);
            throw error;
        } finally {
            setPurchasedCoursesLoading(false);
        }
    }, [isAuthenticated]);

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

    useEffect(() => {
        if (!isAuthenticated) {
            setPurchasedCourses(null);
            return;
        }

        refreshPurchasedCourses().catch(() => {
            // el error ya se maneja en el estado, no necesitamos propagarlo aquí
        });
    }, [isAuthenticated, refreshPurchasedCourses]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                setAuthenticated,
                checkingAuth,
                user,
                setUser,
                refreshUser,
                purchasedCourses,
                purchasedCoursesLoading,
                purchasedCoursesError,
                refreshPurchasedCourses,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
