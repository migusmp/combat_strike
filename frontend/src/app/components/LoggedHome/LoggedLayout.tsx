"use client";
import styles from "./css/LoggedHome.module.css";
import { useState, useEffect, useRef } from "react";
import HeaderPrueba from "../Home/HeaderPrueba";
import { useAuthContext } from "@/app/context/AuthContext";

export default function LoggedLayout({ children }: { children: React.ReactNode }) {
    const [menuUser, setUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<SVGSVGElement>(null);
    const { isAuthenticated } = useAuthContext();

    const toggleUserMenu = () => setUserMenu(!menuUser);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Si el menú está abierto y el click NO es sobre el icono ni sobre el menú, cerramos
            if (
                menuUser &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                iconRef.current &&
                !iconRef.current.contains(event.target as Node)
            ) {
                setUserMenu(false);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [menuUser]);

    return (
        <>
            <HeaderPrueba isLogged={isAuthenticated} toggleUserMenu={toggleUserMenu} />
            <main className={styles.mainContent} style={{ marginTop: "85px", flex: 1 }}>
                {children}
            </main>
        </>
    );
}
