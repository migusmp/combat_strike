'use client';
import GuestHome from './components/Home/GuestHome';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuthContext } from './context/AuthContext';
import LoggedLayout from './components/LoggedHome/LoggedLayout';
import LoggedHome from './components/LoggedHome/LoggedHome';
import { API_URL } from './utils/api_url';

export default function Home() {
    const { isAuthenticated } = useAuthContext();

    console.log("API_URL:", API_URL);

    if (isAuthenticated === null) return <LoadingSpinner />;

    return isAuthenticated
        ? <LoggedLayout><LoggedHome /></LoggedLayout>
        : <GuestHome />;
}
