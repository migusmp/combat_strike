// app/page.tsx
"use client";
import GuestHome from './components/Home/GuestHome';
import HomeExperience from './components/LoggedHome/HomeExperience';
import { useAuthContext } from './context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuthContext();

  // Opcional: puedes mostrar distinto contenido según esté logueado
  return (
    <>
      {isAuthenticated ? <HomeExperience /> : <GuestHome />}
    </>
  );
}
