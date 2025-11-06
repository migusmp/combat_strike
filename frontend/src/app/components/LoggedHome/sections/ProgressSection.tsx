"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "../css/LoggedHome.module.css";
import { InProgressCourse } from "../data/content";

type Props = {
    courses: InProgressCourse[];
};

export default function ProgressSection({ courses }: Props) {
    if (!courses.length) {
        return null;
    }

    return (
        <section className={styles.progressSection}>
            <div className={styles.sectionHeader}>
                <span className={styles.sectionEyebrow}>Tu avance</span>
                <h2>Cursos en progreso</h2>
                <p>Retoma los módulos pendientes y mantén la constancia.</p>
            </div>
            <div className={styles.courseList}>
                {courses.map((course) => (
                    <article key={course.id} className={styles.courseCard}>
                        <div className={styles.cardHeader}>
                            <Image
                                src={course.image}
                                alt={course.title}
                                width={120}
                                height={80}
                                className={styles.courseThumbnail}
                            />
                            <div>
                                <span className={styles.courseCategory}>{course.category}</span>
                                <h3>{course.title}</h3>
                            </div>
                        </div>
                        <p className={styles.courseLesson}>Último bloque: {course.lastLesson}</p>
                        <p className={styles.courseNext}>Siguiente objetivo: {course.nextLesson}</p>
                        <div className={styles.progressBar}>
                            <div style={{ width: `${course.progress}%` }} />
                        </div>
                        <footer>
                            <span>{course.progress}% completado</span>
                            <Link href={`/cursos/${course.id}`} className={styles.secondaryBtn}>
                                Continuar
                            </Link>
                        </footer>
                    </article>
                ))}
            </div>
        </section>
    );
}
