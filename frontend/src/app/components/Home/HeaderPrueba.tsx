"use client";
import Image from "next/image";
import Link from "next/link";
import styles from "../../css/HeaderPrueba.module.css";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import UserMenu from "../LoggedHome/components/UserMenu";

interface HeaderProps {
    toggleUserMenu?: () => void;
    isLogged: boolean;
}

export default function HeaderPrueba({ isLogged, toggleUserMenu }: HeaderProps) {
    const [loginMenu, setLoginMenu] = useState(false);
    const [darkBg, setDarkBg] = useState(false);
    const [menuUser, setUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLImageElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    const toggleLoginMenu = () => setLoginMenu(!loginMenu);
    const toggleUserDropdown = () => setUserMenu(!menuUser);

    // Cerrar menú de usuario al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
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
        return () => document.removeEventListener("click", handleClickOutside);
    }, [menuUser]);

    // Fondo dinámico al hacer scroll
    useEffect(() => {
        const handleScroll = () => setDarkBg(window.scrollY > 0);
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const getLinkClass = (href: string) => (pathname === href ? styles.active : "");

    return (
        <>
            <header
                className={styles.header}
                style={{
                    backgroundColor: darkBg
                        ? "rgba(0, 0, 0, 0.9)"
                        : "rgba(0, 0, 0, 1)",
                    backdropFilter: darkBg
                        ? "blur(8px) brightness(0.6)"
                        : "blur(8px) brightness(1)",
                    transition: "background-color 0.3s ease, backdrop-filter 0.3s ease",
                }}
            >
                <Link href="/contact" className={styles.contactBtn}>
                    <p className={styles.contactText}>Contáctanos</p>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        className={styles.telephoneSvg}
                        viewBox="0 0 16 16"
                    >
                        <path
                            fillRule="evenodd"
                            d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"
                        />
                    </svg>
                </Link>

                <Image
                    width={70}
                    height={70}
                    src="/assets/logo-blanco-sin-texto-small.webp"
                    alt="logo"
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push("/")}
                />

                <div className={styles.buttons}>
                    <nav aria-label="Navegación principal">
                        <Link href="/" className={getLinkClass("/")}>Inicio</Link>
                        <Link href="/cursos" className={getLinkClass("/cursos")}>Cursos</Link>
                        <Link href="/productos" className={getLinkClass("/productos")}>Productos</Link>
                        <Link href="/contact" className={getLinkClass("/contact")}>Contáctanos</Link>
                    </nav>

                    {isLogged ? (
                        <>
                            <div className={styles.icons}>
                                {/* 🔔 Notificaciones */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="33"
                                    height="33"
                                    fill="currentColor"
                                    className={styles.bellIcon}
                                    style={{ cursor: "pointer" }}
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                                </svg>

                                {/* 👤 Imagen del usuario (reemplaza botones login/register en escritorio) */}
                                <div className={styles.profileContainer}>
                                    <Image
                                        ref={iconRef}
                                        src="/assets/user_logo.svg"
                                        alt="imagen de usuario"
                                        width={45}
                                        height={45}
                                        className={styles.userImage}
                                        onClick={toggleUserDropdown}
                                        style={{ cursor: "pointer", borderRadius: "50%" }}
                                    />
                                    {menuUser && <UserMenu ref={menuRef} />}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="45"
                                height="45"
                                fill="currentColor"
                                className={styles.userIcon}
                                onClick={toggleLoginMenu}
                                viewBox="0 0 16 16"
                            >
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                <path
                                    fillRule="evenodd"
                                    d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                                />
                            </svg>

                            {loginMenu && (
                                <div className={styles.userMenu}>
                                    <Link href="/login">
                                        <button className={styles.loginBtnDropdown}>Iniciar sesión</button>
                                    </Link>
                                    <Link href="/register">
                                        <button className={styles.registerBtnDropdown}>Registrate</button>
                                    </Link>
                                </div>
                            )}

                            <Link href="/login">
                                <button className={styles.loginBtn}>Iniciar sesión</button>
                            </Link>
                            <Link href="/register">
                                <button className={styles.registerBtn}>Registrarse</button>
                            </Link>
                        </>
                    )}
                </div>
            </header>

            <section className={styles.headerMobile}>
                <nav>
                    <Link href="/cursos">Cursos</Link>
                    <Link href="/productos">Productos</Link>
                </nav>
            </section>
        </>
    );
}

