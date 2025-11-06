"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import UserMenu from "../LoggedHome/components/UserMenu";
import styles from "../../css/HeaderPrueba.module.css";

interface HeaderProps {
    toggleUserMenu?: () => void;
    isLogged: boolean;
}

const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/cursos", label: "Cursos" },
    { href: "/productos", label: "Productos" },
    { href: "/contact", label: "Contáctanos" },
];

export default function HeaderPrueba({ isLogged, toggleUserMenu }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [darkBg, setDarkBg] = useState(false);
    const [menuUser, setMenuUser] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const handleScroll = () => setDarkBg(window.scrollY > 0);
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuUser &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                iconRef.current &&
                !iconRef.current.contains(event.target as Node)
            ) {
                setMenuUser(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [menuUser]);

    const headerClass = useMemo(
        () => `${styles.header} ${darkBg ? styles.scrolled : ""}`,
        [darkBg]
    );

    const getNavLinkClass = (href: string) =>
        `${styles.navLink} ${pathname === href ? styles.navLinkActive : ""}`;

    const toggleUserDropdown = () => {
        setMenuUser((prev) => !prev);
        toggleUserMenu?.();
    };

    const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    const desktopNavItems = useMemo(() => {
        if (!isLogged) return navItems;
        return [
            navItems[0],
            navItems[1],
            { href: "/mis-cursos", label: "Mis cursos" },
            navItems[2],
            navItems[3],
        ];
    }, [isLogged]);

    return (
        <>
            <header className={headerClass}>
                <div className={styles.inner}>
                    <button
                        type="button"
                        className={styles.brand}
                        onClick={() => router.push("/")}
                        aria-label="Volver al inicio"
                    >
                        <span className={styles.logoGlow}>
                            <Image
                                src="/assets/logo-blanco-sin-texto-small.webp"
                                alt="Logotipo Combat Strike"
                                width={36}
                                height={36}
                                className={styles.logo}
                                priority
                            />
                        </span>
                        <span className={styles.brandCopy}>
                            <span className={styles.brandTitle}>Combat Strike</span>
                        </span>
                    </button>

                    <nav className={styles.nav} aria-label="Navegación principal">
                        {desktopNavItems.map((item) => (
                            <Link key={item.href} href={item.href} className={getNavLinkClass(item.href)}>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className={styles.actions}>
                        {isLogged ? (
                            <div className={styles.iconCluster}>
                                <button type="button" className={styles.iconButton} aria-label="Notificaciones">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                                    </svg>
                                </button>
                                <div className={styles.profileContainer}>
                                    <Image
                                        ref={iconRef}
                                        src="/assets/user_logo.svg"
                                        alt="Avatar de usuario"
                                        width={44}
                                        height={44}
                                        className={styles.userImage}
                                        onClick={toggleUserDropdown}
                                    />
                                    {menuUser && <UserMenu ref={menuRef} />}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.ctaGroup}>
                                <Link href="/login" className={styles.ctaGhost}>
                                    Iniciar sesión
                                </Link>
                                <Link href="/register" className={styles.ctaPrimary}>
                                    Registrarse
                                </Link>
                            </div>
                        )}

                        <button
                            type="button"
                            className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ""}`}
                            onClick={toggleMobileMenu}
                            aria-label="Abrir menú"
                        >
                            <span className={styles.bar} />
                            <span className={styles.bar} />
                            <span className={styles.bar} />
                        </button>
                    </div>
                </div>
            </header>

            <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ""}`}>
                <nav aria-label="Navegación móvil">
                    {desktopNavItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={closeMobileMenu} className={styles.mobileLink}>
                            {item.label}
                        </Link>
                    ))}
                </nav>
                {!isLogged && (
                    <>
                        <Link href="/login" onClick={closeMobileMenu}>
                            <button type="button" className={styles.loginBtnMobile}>
                                Iniciar sesión
                            </button>
                        </Link>
                        <Link href="/register" onClick={closeMobileMenu}>
                            <button type="button" className={styles.registerBtnMobile}>
                                Registrarse
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </>
    );
}
