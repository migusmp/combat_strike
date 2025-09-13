// hooks/useRedirectIfAuth.ts
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../context/AuthContext';

export const useRedirectIfAuth = () => {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/'); // redirige a Home si ya está logueado
    }
  }, [isAuthenticated, router]);
};
