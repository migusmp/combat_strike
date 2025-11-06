"use client";

import Link from "next/link";
import styles from "../css/NewUserHome.module.css";

type Props = {
    userName: string;
};

export default function NewUserHeroSection({ userName }: Props) {
    return (
        <section className={styles.heroSection}>
            <div className={styles.heroContent}>
                <p className={styles.heroEyebrow}>Bienvenido a Combat Strike</p>
                <h1 className={styles.heroGreeting}>¡Hola, {userName}! ⚡</h1>
                <p className={styles.heroDescription}>
                    Hemos preparado un itinerario para que tus primeros días sean claros, motivantes y sin fricciones.
                    Completa las misiones rápidas y activa tu primera sesión práctica en minutos.
                </p>
                <div className={styles.heroActions}>
                    <Link href="/cursos" className={styles.primaryCTA}>
                        Comenzar mi primer curso
                    </Link>
                    <Link href="/briefing" className={styles.secondaryCTA}>
                        Ver briefing inicial
                    </Link>
                </div>
            </div>
            <div className={styles.heroHighlights}>
                <div className={styles.highlightItem}>
                    <span className={styles.sectionEyebrow}>Tu estado</span>
                    <strong>Modo inicio</strong>
                    <small>Configura tu perfil para recibir recomendaciones dinámicas.</small>
                </div>
                <div className={styles.highlightItem}>
                    <span className={styles.sectionEyebrow}>Próximo checkpoint</span>
                    <strong>3 misiones</strong>
                    <small>Desbloquea tu primera insignia completando los pasos sugeridos.</small>
                </div>
            </div>
        </section>
    );
}
