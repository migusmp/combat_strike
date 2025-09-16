import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";  // 👈 en vez de useRouter
import styles from "../../css/HeaderPrueba.module.css";

export default function HeaderPrueba() {
    const pathname = usePathname(); // 👈 ahora sí tienes la ruta

    return (
        <header className={styles.header}>
            <Image
                width={70}
                height={70}
                src="/assets/logo-blanco-sin-texto.png"
                alt="logo"
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
                </nav>
                <Link href="/login">
                    <button className={styles.loginBtn}>Iniciar sesión</button>
                </Link>
                <Link href="/register">
                    <button className={styles.registerBtn}>Registrarse</button>
                </Link>
            </div>
        </header>
    );
}
