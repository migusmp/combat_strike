"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "../css/NewUserHome.module.css";
import { Recommendation } from "../data/content";

type Props = {
    courses: Recommendation[];
    isLoading: boolean;
    error: string | null;
};

export default function DiscoverySection({ courses, isLoading, error }: Props) {
    return (
        <section className={styles.discoverySection}>
            <div className={styles.sectionHeader}>
                <div className={styles.discoverySubhead}>
                    <span className={`${styles.sectionEyebrow} ${styles.discoveryEyebrow}`}>
                        Recomendados para empezar
                    </span>
                    <span className={styles.discoveryPulse} />
                </div>
                <h2 className={styles.discoveryTitle}>Cursos diseñados para tu primer contacto</h2>
                <p className={`${styles.emptyStateNote} ${styles.discoveryDescription}`}>
                    Elige uno para desbloquear tu primera insignia y registrar tu primer progreso.
                </p>
            </div>
            {isLoading && <p className={styles.emptyStateNote}>Cargando cursos recomendados...</p>}
            {error && !isLoading && (
                <p className={styles.emptyStateNote}>
                    No se pudieron cargar los cursos, te dejamos algunas sugerencias clave.
                </p>
            )}
            <div className={styles.discoveryGrid}>
                {courses.map((course) => (
                    <article key={course.id} className={styles.discoveryCard}>
                        <div className={styles.discoveryMedia}>
                            <Image
                                src={course.image || "/assets/foto-curso-krav-maga.png"}
                                alt={course.title}
                                fill
                                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 280px"
                                className={styles.discoveryImage}
                            />
                            {course.category && (
                                <span className={styles.discoveryChip}>{course.category}</span>
                            )}
                        </div>
                        <div className={styles.discoveryBody}>
                            <h3>{course.title}</h3>
                            <p>{course.description}</p>
                            <footer>
                                <span>{course.meta}</span>
                                <Link href={course.href}>Explorar →</Link>
                            </footer>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
