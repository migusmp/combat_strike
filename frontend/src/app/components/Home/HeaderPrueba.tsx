import Image from "next/image";
import Link from "next/link";
import styles from "../../css/HeaderPrueba.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeaderPrueba() {
    const [loginMenu, setLoginMenu] = useState(false);
    const router = useRouter();

    const toggleLoginMenu = () => {
        setLoginMenu(!loginMenu);
    };


    return (
        <>
            <header className={styles.header}>
                <Link href="/contact" className={styles.contactBtn}>
                    <p className={styles.contactText}>Contáctanos</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className={styles.telephoneSvg} viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
                    </svg>
                </Link>
                <Image
                    width={70}
                    height={70}
                    src="/assets/logo-blanco-sin-texto.png"
                    alt="logo"
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push("/")}
                />
                <div className={styles.buttons}>
                    <nav>
                        <Link href="/">
                            Inicio
                        </Link>
                        <Link href="/cursos">
                            Cursos
                        </Link>
                        <Link href="/shop">
                            Tienda
                        </Link>
                        <Link href="/contact">
                            Contáctanos
                        </Link>
                    </nav>
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
                    {/* Menú desplegable para usuario no logueado */}
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
                </div>
            </header>
            <section className={styles.headerMobile}>
                <nav>
                    <Link href="/cursos">Cursos</Link>
                    <Link href="/shop">Tienda</Link>
                </nav>
            </section>
        </>
    );
}
