'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface GuestGuardProps {
  children: ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isAuthenticated === null) return; // esperando validación
    if (isAuthenticated) {
      router.replace('/'); // redirige inmediatamente si está logueado
    } else {
      setShowContent(true); // mostrar contenido si NO está logueado
    }
  }, [isAuthenticated, router]);

  if (!showContent) return <LoadingSpinner />; // spinner mientras se decide

  return <>{children}</>;
}
