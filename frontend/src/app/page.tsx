'use client';
import LoggedHome from './components/Home/LoggedHome';
import GuestHome from './components/Home/GuestHome';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuthContext } from './context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuthContext();

  if (isAuthenticated === null) return <LoadingSpinner />;

  return isAuthenticated ? <LoggedHome /> : <GuestHome />;
}
