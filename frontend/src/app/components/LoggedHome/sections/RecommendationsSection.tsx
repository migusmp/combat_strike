"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "../css/LoggedHome.module.css";
import { RecommendedCourse } from "../data/content";

type Props = {
    courses: RecommendedCourse[];
};

export default function RecommendationsSection({ courses }: Props) {
    if (!courses.length) {
        return null;
    }

    return (
        <section className={styles.recommendSection}>
            <div className={styles.sectionHeader}>
                <span className={styles.sectionEyebrow}>Sigue aprendiendo</span>
                <h2>Selección hecha para ti</h2>
                <p>Curado según tu ritmo y las habilidades que ya dominaste.</p>
            </div>
            <div className={styles.recommendGrid}>
                {courses.map((course) => (
                    <article key={course.id} className={styles.recommendCard}>
                        <Image src={course.image} alt={course.title} width={180} height={120} />
                        <div>
                            <h3>{course.title}</h3>
                            <span>{course.duration}</span>
                        </div>
                        <Link href={`/cursos/${course.id}`}>Ver detalles</Link>
                    </article>
                ))}
            </div>
        </section>
    );
}
