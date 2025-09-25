"use client";
import styles from "./css/LoggedHome.module.css";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import UserMenu from "./components/UserMenu";

export default function LoggedLayout({ children }: { children: React.ReactNode }) {
    const [menuUser, setUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<SVGSVGElement>(null);

    const toggleLoginMenu = () => setUserMenu(!menuUser);

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
            <header className={styles.header}>
                <Link href="/contact" className={styles.contactBtn}>
                    <p>Contactános</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className={styles.telephoneSvg} viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
                    </svg>
                </Link>
                <Link href="/">
                    <Image
                        src="/assets/logo-blanco-sin-texto.png"
                        width={70}
                        height={70}
                        alt="logo"
                        style={{ cursor: "pointer" }}
                    />
                </Link>

                <section>
                    <nav>
                        <Link href="/">Inicio</Link>
                        <Link href="/cursos">Cursos</Link>
                        <Link href="/productos">Productos</Link>
                        <Link href="/contact">Contáctanos</Link>
                    </nav>

                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-bell" viewBox="0 0 16 16">
                        <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                    </svg>

                    <svg
                        ref={iconRef}
                        xmlns="http://www.w3.org/2000/svg"
                        width="45"
                        height="45"
                        fill="currentColor"
                        className={styles.userIcon}
                        style={{ cursor: "pointer" }}
                        onClick={toggleLoginMenu}
                        viewBox="0 0 16 16"
                    >
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                        <path
                            fillRule="evenodd"
                            d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                        />
                    </svg>
                </section>

                {menuUser && <UserMenu ref={menuRef} />}

            </header>
            <nav className={styles.navbar}>
                <Link href="/cursos">Cursos</Link>
                <Link href="/productos">Productos</Link>
            </nav>

            <main className={styles.mainContent}>
                {children}
            </main>
        </>
    );
}
