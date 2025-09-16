import Image from "next/image";
import styles from '../../css/HeaderPrueba.module.css'
import Link from "next/link";

export default function HeaderPrueba() {
    return <header className={styles.header}>
        <Image width={70} height={70} src="/assets/logo-blanco-sin-texto.png" alt="logo" />
        <div className={styles.buttons}>
            <nav>
                <Link href="/">Inicio</Link>
                <Link href="/cursos">Cursos</Link>
                <Link href="/shop">Tienda</Link>
            </nav>
            <button className={styles.loginBtn}>Iniciar sesión</button>
            <button className={styles.registerBtn}>Registrarse</button>
        </div>
    </header>
}
