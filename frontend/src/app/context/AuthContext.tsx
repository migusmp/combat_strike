'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '../utils/api_url';

interface AuthContextType {
  isAuthenticated: boolean | null;
  setAuthenticated: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  setAuthenticated: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_URL}/auth/validate`, {
          credentials: 'include', // para enviar la cookie httpOnly
        });
        console.log("RESPUESTA DEL SERVIDOR: ",res);
        setAuthenticated(res.ok);
      } catch {
        setAuthenticated(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
