"use client";

import { useState, useEffect } from "react";
import useCourses from "@/app/hooks/useCourses";
import styles from "../css/Course.module.css";

interface CourseContentProps {
    courseId: number;
}

export default function CourseContent({ courseId }: CourseContentProps) {
    const { courses, isLoading, error } = useCourses();

    // Buscar el curso correspondiente
    const course = courses?.find((c) => Number(c.id) === courseId);

    // Estados
    const [openSections, setOpenSections] = useState<boolean[]>([]);

    // Inicializa openSections cuando el curso esté disponible
    useEffect(() => {
        if (course) {
            setOpenSections(Array(course.content.length).fill(false));
        }
    }, [course]);

    if (isLoading) return <p>Cargando contenido del curso...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!course) return <p>Curso no encontrado</p>;

    // Calcular totales
    const totalSections = course.content.length;
    const totalClasses = course.content.reduce(
        (sum, section) => sum + section.classes.length,
        0
    );

    const totalDuration = course.content.reduce(
        (acc, section) => {
            section.classes.forEach((cls) => {
                acc.hours += cls.duration.hours;
                acc.minutes += cls.duration.minutes;
            });
            return acc;
        },
        { hours: 0, minutes: 0 }
    );

    totalDuration.hours += Math.floor(totalDuration.minutes / 60);
    totalDuration.minutes = totalDuration.minutes % 60;

    const toggleSection = (index: number) => {
        setOpenSections((prev) => {
            const newState = [...prev];
            newState[index] = !newState[index];
            return newState;
        });
    };

    const toggleAllSections = () => {
        const allOpen = openSections.every(Boolean);
        setOpenSections(Array(totalSections).fill(!allOpen));
    };

    return (
        <section className={styles.courseContentSection}>
            <div className={styles.courseContentHeader}>
                <div>
                    <p className={styles.contentEyebrow}>Plan de estudio</p>
                    <h2>Contenido del curso</h2>
                </div>
                <div className={styles.courseContentSummary}>
                    <p className={styles.courseContentMeta}>
                        {totalSections} secciones · {totalClasses} clases ·{" "}
                        {totalDuration.hours} h {totalDuration.minutes} min totales
                    </p>
                    <button
                        onClick={toggleAllSections}
                        className={styles.expandAllButton}
                    >
                        {openSections.every(Boolean) ? "Contraer todas" : "Ampliar todas"}
                    </button>
                </div>
            </div>

            {course.content.map((section, idx) => (
                <div key={idx} className={styles.courseSection}>
                    <button
                        className={styles.sectionHeader}
                        onClick={() => toggleSection(idx)}
                    >
                        {section.sectionTitle}
                        <span className={styles.chevron}>
                            {openSections[idx] ? "▲" : "▼"}
                        </span>
                    </button>
                    <div
                        className={`${styles.sectionClasses} ${openSections[idx] ? styles.open : ""
                            }`}
                    >
                        <ul>
                            {section.classes.map((cls, cidx) => (
                                <li key={cidx}>
                                    <span className={styles.className}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-play-btn"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
                                        </svg>
                                        {cls.title}
                                    </span>
                                    <span className={styles.classDuration}>
                                        {cls.duration.hours > 0 ? `${cls.duration.hours} h ` : ""}
                                        {cls.duration.minutes} min
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </section>
    );
}
