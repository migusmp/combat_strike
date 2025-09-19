// src/app/verify/page.tsx
'use client'; // ⚠️ Necesario para deshabilitar SSR

import dynamic from 'next/dynamic';

// Importamos dinámicamente el componente sin SSR
const VerifyPage = dynamic(() => import('./VerifyPage'), { ssr: false });

export default VerifyPage;
