'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
    const [message, setMessage] = useState('Verificando...');
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setMessage('La sesión de verificación ha expirado');
            return;
        }

        const verifyAccount = async () => {
            try {
                const res = await fetch(`http://localhost:4000/auth/verify?token=${token}`, {
                    method: 'GET',
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Error al verificar la cuenta');

                setMessage(data.message);
            } catch (err: any) {
                setMessage("Sesión expirada");
            }
        };

        verifyAccount();
    }, [token]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "20px",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#ffffff",
            }}
        >
            <h1
                style={{
                    color: "#055293",
                    fontSize: "3rem",
                    textAlign: "center",
                    fontWeight: "bold",
                }}
            >
                {message}
            </h1>
            <Link href="/login" style={{ backgroundColor: "#000032", padding: "15px", borderRadius: "5px", fontWeight: "bold"}}>Ir a iniciar sesión</Link>
        </div>
    );
}
