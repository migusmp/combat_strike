// src/app/verify/page.tsx
'use client';

import { Suspense } from 'react';
import VerifyPage from './VerifyPage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VerifyPage />
    </Suspense>
  );
}
