'use client';
import GuestHome from './components/Home/GuestHome';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuthContext } from './context/AuthContext';
import LoggedLayout from './components/LoggedHome/LoggedLayout';
import LoggedHome from './components/LoggedHome/LoggedHome';

export default function Home() {
    const { isAuthenticated } = useAuthContext();

    if (isAuthenticated === null) return <LoadingSpinner />;

    return isAuthenticated
        ? <LoggedLayout><LoggedHome /></LoggedLayout>
        : <GuestHome />;
}
