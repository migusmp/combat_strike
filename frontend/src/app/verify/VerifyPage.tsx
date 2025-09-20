// src/app/verify/VerifyPage.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '../utils/api_url';

export default function VerifyPage() {
  const [message, setMessage] = useState('Verificando...');
  const [verified, setVerified] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  useEffect(() => {
    if (!token || verified) return;

    const verifyAccount = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/verify?token=${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al verificar la cuenta');
        setMessage(data.message);
        setVerified(true); // marca como verificado y evita repetir request
      } catch (err) {
        setMessage('Sesión expirada');
        console.error(err);
      }
    };

    verifyAccount();
  }, [token, verified]);;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, alignItems: 'center', height: '100vh', backgroundColor: '#fff' }}>
      <h1 style={{ color: '#055293', fontSize: '3rem', textAlign: 'center', fontWeight: 'bold' }}>{message}</h1>
      <Link href="/login" style={{ backgroundColor: '#000032', padding: 15, borderRadius: 5, fontWeight: 'bold' }}>
        Ir a iniciar sesión
      </Link>
    </div>
  );
}
