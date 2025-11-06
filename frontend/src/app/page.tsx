// app/page.tsx
"use client";
import GuestHome from './components/Home/GuestHome';
import LoggedHome from './components/LoggedHome/LoggedHome';
import NewUserHome from './components/LoggedHome/NewUserHome';
import { useAuthContext } from './context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuthContext();

  // Opcional: puedes mostrar distinto contenido según esté logueado
  return (
    <>
      {isAuthenticated ? <NewUserHome /> : <GuestHome />}
    </>
  );
}
