"use client";
// import Image from "next/image";
import Link from "next/link";
import styles from "../../css/CoursesSection.module.css";
import { useEffect, useRef, useState } from "react";

export default function CoursesSection() {
    const courses = [
        {
            title: "CURSO CON SPRAYS",
            topics: ["TIPOS DE SPRAY", "USO DEL SPRAY", "SITUACIONES SPRAY"],
        },
        {
            title: "VIDEOS SITUACIONES COTIDIANAS SIN MATERIALES",
            topics: ["Aprende técnicas sin necesidad de material", "Defensa en situaciones reales"],
        },
    ];

    // Ref y estado para el título
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [titleVisible, setTitleVisible] = useState(false);

    // Refs y estados para cada tarjeta
    const cardRefs = useRef<(HTMLDivElement)[]>([]);
    const [visibleCards, setVisibleCards] = useState<boolean[]>(courses.map(() => false));

    useEffect(() => {
        // Observer para el título
        const titleObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTitleVisible(true);
                    titleObserver.unobserve(entry.target);
                }
            },
            { threshold: 0.5 }
        );
        if (titleRef.current) titleObserver.observe(titleRef.current);

        // Observer para las tarjetas
        const cardObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = cardRefs.current.indexOf(entry.target as HTMLDivElement);
                    if (entry.isIntersecting && index !== -1) {
                        setVisibleCards((prev) => {
                            const updated = [...prev];
                            updated[index] = true;
                            return updated;
                        });
                        cardObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        cardRefs.current.forEach((card) => {
            if (card) cardObserver.observe(card);
        });

        return () => {
            titleObserver.disconnect();
            cardObserver.disconnect();
        };
    }, []);

    return (
        <section className={styles.coursesSection}>
            <h2
                ref={titleRef}
                className={`${styles.sectionTitle} ${titleVisible ? styles.sectionTitleVisible : ""}`}
            >
                Nuestros Cursos
            </h2>
            <div className={styles.coursesContainer}>
                {courses.map((course, index) => (
                    <div
                        key={index}
                        ref={(el) => {
                            if (el) cardRefs.current[index] = el;
                        }}
                        className={`${styles.courseCard} ${visibleCards[index] ? styles.courseCardVisible : ""}`}
                    >
                        <h3 className={styles.courseTitle}>{course.title}</h3>
                        <ul className={styles.courseTopics}>
                            {course.topics.map((topic, i) => (
                                <li key={i}>{topic}</li>
                            ))}
                        </ul>
                        <Link href="/login" className={styles.courseBtn}>
                            Ver más
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}

