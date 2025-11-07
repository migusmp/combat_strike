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

const notificationSamples = [
    { id: "notif-1", title: "Nuevo módulo táctico disponible", time: "Hace 2 h" },
    { id: "notif-2", title: "Actualizaste tu plan de entrenamiento", time: "Ayer" },
];

export default function HeaderPrueba({ isLogged, toggleUserMenu }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [darkBg, setDarkBg] = useState(false);
    const [menuUser, setMenuUser] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLImageElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (!notificationsOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notificationsOpen]);

    useEffect(() => {
        if (!isLogged) {
            setNotificationsOpen(false);
        }
    }, [isLogged]);

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

    useEffect(() => {
        if (!mobileMenuOpen) return;
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        const scrollBarCompensation = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = "hidden";
        if (scrollBarCompensation > 0) {
            document.body.style.paddingRight = `${scrollBarCompensation}px`;
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, [mobileMenuOpen]);

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

    const notifications = useMemo(() => (isLogged ? notificationSamples : []), [isLogged]);

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
                                <div className={styles.notificationWrapper} ref={notificationRef}>
                                    <button
                                        type="button"
                                        className={`${styles.iconButton} ${notificationsOpen ? styles.iconButtonActive : ""}`}
                                        aria-label="Notificaciones"
                                        aria-haspopup="menu"
                                        aria-expanded={notificationsOpen}
                                        onClick={() => setNotificationsOpen((prev) => !prev)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                                        </svg>
                                        {notifications.length > 0 && <span className={styles.notificationBadge}>{notifications.length}</span>}
                                    </button>
                                    {notificationsOpen && (
                                        <div className={styles.notificationDropdown} role="menu" aria-label="Notificaciones">
                                            <div className={styles.notificationHeader}>
                                                <div>
                                                    <p>Alertas</p>
                                                    <strong>Notificaciones</strong>
                                                </div>
                                                <span>{notifications.length} nuevas</span>
                                            </div>
                                            {notifications.length === 0 ? (
                                                <p className={styles.notificationEmpty}>No hay notificaciones por ahora.</p>
                                            ) : (
                                                <ul className={styles.notificationList}>
                                                    {notifications.map((notification) => (
                                                        <li key={notification.id} className={styles.notificationItem}>
                                                            <span>{notification.title}</span>
                                                            <small>{notification.time}</small>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            <button type="button" className={styles.notificationAction}>
                                                Ver historial
                                            </button>
                                        </div>
                                    )}
                                </div>
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

            <div
                className={`${styles.mobileMenuOverlay} ${mobileMenuOpen ? styles.mobileMenuOverlayVisible : ""}`}
                onClick={closeMobileMenu}
                aria-hidden={!mobileMenuOpen}
            >
                <div
                    className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ""}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menú principal"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className={styles.mobileMenuHeader}>
                        <div>
                            <p className={styles.mobileMenuEyebrow}>Explora</p>
                            <h3>Centro de operaciones</h3>
                            <p className={styles.mobileMenuSubtitle}>Accede a los módulos clave de Combat Strike.</p>
                        </div>
                        <button
                            type="button"
                            className={styles.mobileCloseButton}
                            onClick={closeMobileMenu}
                            aria-label="Cerrar menú"
                        >
                            ×
                        </button>
                    </div>

                    <div className={styles.mobileMenuBadge}>Entrena inteligente · Avanza seguro</div>

                    <nav className={styles.mobileNav} aria-label="Navegación móvil">
                        {desktopNavItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            const sequence = `${index + 1}`.padStart(2, "0");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeMobileMenu}
                                    className={`${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ""}`}
                                >
                                    <div className={styles.mobileLinkContent}>
                                        <span className={styles.mobileLinkIndex}>{sequence}</span>
                                        <span className={styles.mobileLinkLabel}>{item.label}</span>
                                    </div>
                                    <svg
                                        className={styles.mobileLinkIcon}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M5 12h14" />
                                        <path d="m13 6 6 6-6 6" />
                                    </svg>
                                </Link>
                            );
                        })}
                    </nav>

                    {isLogged ? (
                        <div className={styles.mobileMenuStatus}>
                            <span className={styles.mobileStatusLabel}>Sesión activa</span>
                            <p>Administra tu cuenta y tus cursos sin salir del panel.</p>
                            <Link
                                href="/account"
                                onClick={closeMobileMenu}
                                className={`${styles.mobileMenuButton} ${styles.mobileMenuPrimary}`}
                            >
                                Ir a mi cuenta
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.mobileMenuCtas}>
                            <Link
                                href="/login"
                                onClick={closeMobileMenu}
                                className={`${styles.mobileMenuButton} ${styles.mobileMenuGhost}`}
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                href="/register"
                                onClick={closeMobileMenu}
                                className={`${styles.mobileMenuButton} ${styles.mobileMenuPrimary}`}
                            >
                                Registrarse
                            </Link>
                        </div>
                    )}

                    <div className={styles.mobileMenuFooter}>
                        <span>¿Necesitas ayuda?</span>
                        <a href="mailto:hola@combatstrike.com">hola@combatstrike.com</a>
                    </div>
                </div>
            </div>
        </>
    );
}
