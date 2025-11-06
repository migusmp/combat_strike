import Link from "next/link";
import styles from "../../css/Home.module.css";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.footerGlow} />
            <div className={styles.footerContent}>
                <div className={styles.footerBrand}>
                    <span className={styles.footerLogo}>DL Combat Strike</span>
                    <p className={styles.footerMotto}>
                        Operativa moderna, mentalidad táctica y defensa personal avanzada para quienes protegen lo que importa.
                    </p>
                    <div className={styles.footerContactBlock}>
                        <p>📧 contacto@dlcombatstrike.com</p>
                        <p>📍 Operamos en toda España</p>
                    </div>
                </div>

                <div className={styles.footerCTA}>
                    <p className={styles.footerCTAOverline}>Entrena con propósito</p>
                    <h3>Activa tu modo defensa</h3>
                    <p>
                        Programas presenciales y online con instructores especializados en protección civil y operativa.
                    </p>
                    <div className={styles.footerCTAActions}>
                        <Link href="/register" className={styles.footerButtonPrimary}>
                            Empieza hoy
                        </Link>
                        <Link href="/contact" className={styles.footerButtonGhost}>
                            Habla con nosotros
                        </Link>
                    </div>
                </div>

                <div className={styles.footerNavBlock}>
                    <p className={styles.footerNavLabel}>Navegación</p>
                    <nav aria-label="Navegación del pie de página" className={styles.footerNav}>
                        <a href="#about">Sobre nosotros</a>
                        <a href="#cursos">Cursos</a>
                        <a href="#tienda">Tienda</a>
                        <a href="#valores">Valores</a>
                        <a href="#contact">Contacto</a>
                    </nav>
                </div>

                <div className={styles.footerSocial}>
                    <p className={styles.footerNavLabel}>Síguenos</p>
                    <div className={styles.footerSocialIcons}>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                                <path
                                    d="M16 3H8A5 5 0 0 0 3 8v8a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5V8a5 5 0 0 0-5-5z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M17.5 6.5h.01"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </a>

                        <a
                            href="https://tiktok.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="TikTok"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                                <path
                                    d="M15 3h2.5c.2 1.1.81 2.47 1.85 3.74C20.33 7.9 21.7 8.8 23 8.8V11c-2.5 0-4.38-1.13-5.5-2.47V18a6.5 6.5 0 1 1-6.5-6.5V14a3.5 3.5 0 1 0 3.5 3.5z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
            <div className={styles.footerBottom}>
                <span>© {currentYear} DL Combat Strike · Todos los derechos reservados</span>
                <span>Listos 24/7</span>
            </div>
        </footer>
    );
}
