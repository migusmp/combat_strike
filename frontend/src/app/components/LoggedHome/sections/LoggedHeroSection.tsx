"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "../css/LoggedHome.module.css";
import { HeroStat, InProgressCourse } from "../data/content";

type Props = {
    userName: string;
    stats: HeroStat[];
    currentCourse: InProgressCourse;
};

export default function LoggedHeroSection({ userName, stats, currentCourse }: Props) {
    return (
        <section className={styles.heroSection}>
            <div className={styles.heroContent}>
                <span className={styles.sectionEyebrow}>Tu espacio en Combat Strike</span>
                <h1>Hola, {userName} ⚡</h1>
                <p>
                    Continúa donde lo dejaste, revisa tu progreso y explora nuevos desafíos que hemos preparado para ti.
                </p>
                <div className={styles.statsGrid}>
                    {stats.map((stat) => (
                        <article key={stat.label}>
                            <strong>{stat.value}</strong>
                            <span>{stat.label}</span>
                        </article>
                    ))}
                </div>
            </div>
            <div className={styles.currentCourseCard}>
                <span className={styles.sectionEyebrow}>Continuar viendo</span>
                <div className={styles.currentCourseVisual}>
                    <Image
                        src={currentCourse.image}
                        alt={currentCourse.title}
                        fill
                        sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 340px"
                        className={styles.currentCourseImage}
                    />
                    <span className={styles.currentCourseCategory}>{currentCourse.category}</span>
                </div>
                <h2>{currentCourse.title}</h2>
                <p className={styles.currentCourseLesson}>Última lección: {currentCourse.lastLesson}</p>
                <div className={styles.progressBar}>
                    <div style={{ width: `${currentCourse.progress}%` }} />
                </div>
                <div className={styles.currentCourseFooter}>
                    <span>{currentCourse.progress}% completado</span>
                    <Link href={`/cursos/${currentCourse.id}`} className={styles.primaryBtn}>
                        Reanudar
                    </Link>
                </div>
            </div>
        </section>
    );
}
