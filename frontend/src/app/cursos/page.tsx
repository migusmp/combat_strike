"use client";
import Footer from '../components/Home/Footer';
import styles from '../css/Cursos.module.css';
import Carrusel from "./components/Carrusel";

export default function CursosPage() {
    return (
        <>
            <main className={styles.container}>
                <article className={styles.coursesSection}>

                    <div className={styles.introDiv}>
                        <h1 className={styles.introTitle}>Aprende a defenderte con nuestros cursos online</h1>
                        <p className={styles.introText}>
                            En nuestra plataforma, ofrecemos una variedad de cursos de defensa personal diseñados para ayudarte a sentirte seguro y preparado en cualquier situación. Nuestros cursos son impartidos por expertos en el campo de la defensa personal y están diseñados para ser accesibles y fáciles de seguir, sin importar tu nivel de experiencia.
                        </p>
                    </div>

                    <Carrusel />
                </article>
            </main>
            <Footer />
        </>
    );
}
