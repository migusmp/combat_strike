"use client"
import { useEffect, useState } from "react";
import Link from 'next/link';
import Footer from '../components/Home/Footer';
import styles from '../css/Cursos.module.css'

export default function CursosPage() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Activa la animación después de montar el componente
        setLoaded(true);
    }, []);

    const courses = [
        {
            title: "CURSO CON SPRAYS",
            description: "Aprende a utilizar sprays de defensa personal en diferentes situaciones.",
            topics: ["TIPOS DE SPRAY", "USO DEL SPRAY", "SITUACIONES SPRAY"],
        },
        {
            title: "VIDEOS SITUACIONES COTIDIANAS SIN MATERIALES",
            description: "Técnicas de defensa personal sin necesidad de equipamiento, ideales para la vida diaria.",
            topics: ["Aprende técnicas sin necesidad de material", "Defensa en situaciones reales"],
        },
        {
            title: "CURSO CON SPRAYS",
            description: "Aprende a utilizar sprays de defensa personal en diferentes situaciones.",
            topics: ["TIPOS DE SPRAY", "USO DEL SPRAY", "SITUACIONES SPRAY"],
        },
        {
            title: "VIDEOS SITUACIONES COTIDIANAS SIN MATERIALES",
            description: "Técnicas de defensa personal sin necesidad de equipamiento, ideales para la vida diaria.",
            topics: ["Aprende técnicas sin necesidad de material", "Defensa en situaciones reales"],
        },
    ];

    return (
        <>
            <div className={styles.container}>
                <article className={styles.coursesSection}>
                    <h2 className={styles.sectionTitle}>Nuestros Cursos</h2>
                    <div className={styles.coursesGrid}>
                        {courses.map((course, index) => (
                            <div
                                key={index}
                                className={`${styles.courseCard} ${loaded ? styles.fadeInUp : ""}`}
                            >
                                <div className={styles.courseContent}>
                                    <h3 className={styles.courseTitle}>{course.title}</h3>
                                    <p className={styles.courseDescription}>
                                        {course.description || "Aprende todo sobre este curso y domina las técnicas más importantes."}
                                    </p>
                                    <ul className={styles.courseTopics}>
                                        {course.topics.map((topic, i) => (
                                            <li key={i} className={styles.courseTopic}>
                                                {topic}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className={styles.buttonWrapper}>
                                    <Link href="/login" className={styles.courseBtn}>
                                        Ver más
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </div>
            <Footer />
        </>
    );
}
