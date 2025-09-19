// components/LoggedHome.tsx
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../Home/Footer';
import styles from './css/LoggedHome.module.css';

export default function LoggedHome() {
    return (
        <>
            <section className={styles.loggedhome}>
                <h1>Bienvenid@ a Combat Strike 👋</h1>
                <div className={styles.loggedHomeContent}>

                    <article>
                        <h2>Cursos</h2>
                        <p>
                            Aprende las mejores estrategias, mejora tu puntería
                            y conviértete en un experto en Combat Strike.
                        </p>
                        <Image
                            src="/assets/cursos.jpg"
                            alt="Cursos Combat Strike"
                            width={250}
                            height={150}
                        />
                        <Link href="/cursos">
                            <button>Ver cursos</button>
                        </Link>
                    </article>

                    <article>
                        <h2>Tienda</h2>
                        <p>
                            Descubre armas exclusivas, skins y equipamiento
                            único para personalizar tu experiencia de juego.
                        </p>
                        <Image
                            src="/assets/tienda.jpg"
                            alt="Tienda Combat Strike"
                            width={250}
                            height={150}
                        />
                        <Link href="/shop">
                            <button>Ir a tienda</button>
                        </Link>
                    </article>
                </div>
            </section>
            <Footer />
        </>
    );
}

