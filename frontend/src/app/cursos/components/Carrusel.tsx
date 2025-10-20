import styles from "../css/Carrusel.module.css";
import Image from 'next/image';
import { useState } from "react";
import { courses as allCourses } from "../../../lib/mockData";
import Link from "next/link";

type Course = typeof allCourses[number];

export default function Carrusel() {
    const [activeTab, setActiveTab] = useState("Recomendado");

    const tabs = ["Recomendado", "Krav Maga", "Sprays"];

    const getCoursesByTab = (tab: string): Course[] => {
        switch (tab) {
            case "Recomendado":
                return allCourses.filter(c => c.rating >= 4.5);
            case "Krav Maga":
                return allCourses.filter(c => c.id === "krav-maga");
            case "Sprays":
                return allCourses.filter(c => c.id === "sprays");
            default:
                return [];
        }
    };

    const courses = getCoursesByTab(activeTab);

    // Filtramos los cursos nuevos
    const newCourses = allCourses.filter(c => c.isNew);

    const personalDefenseCourses = allCourses.filter(c => c.category === "Defensa Personal");
    const sprayCourses = allCourses.filter(c => c.category === "Sprays");

    return (
        <div className={styles.carruselContainer}>
            {/* Menú de Tabs */}
            <div className={styles.menuContainer}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`${styles.tabButton} ${activeTab === tab ? styles.active : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ✅ Encabezado para el bloque principal */}
            <h2 className={styles.sectionTitle}>
                {activeTab === "Recomendado" && "Cursos recomendados"}
                {activeTab === "Krav Maga" && "Cursos de Krav Maga"}
                {activeTab === "Sprays" && "Cursos de Sprays"}
            </h2>

            {/* Cursos según la Tab */}
            <div className={styles.coursesGrid}>
                {courses.map((course) => (
                    <Link
                        key={course.id}
                        href={`/cursos/${course.id}`}
                        className={styles.courseCard}
                    >
                        <Image
                            width={200}
                            height={200}
                            src={course.image}
                            alt={course.title}
                            className={styles.courseImage}
                        />
                        <h3 className={styles.courseTitle}>{course.title}</h3>
                        <p className={styles.courseAuthor}>{course.description}</p>
                        <p className={styles.coursePrice}>{course.price} €</p>
                    </Link>
                ))}
            </div>

            {/* CURSOS DE KRAV MAGA */}
            {personalDefenseCourses.length > 0 && (
                <div className={styles.newCoursesSection}>
                    <h2 className={styles.sectionTitle}>Defensa Personal</h2>
                    <div className={styles.coursesGrid}>
                        {personalDefenseCourses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/cursos/${course.id}`}
                                className={styles.courseCard}
                            >
                                <Image
                                    width={200}
                                    height={200}
                                    src={course.image}
                                    alt={course.title}
                                    className={styles.courseImage}
                                />
                                <h3 className={styles.courseTitle}>{course.title}</h3>
                                <p className={styles.courseAuthor}>{course.description}</p>
                                <p className={styles.coursePrice}>{course.price} €</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* NUEVOS CURSOS */}
            {sprayCourses.length > 0 && (
                <div className={styles.newCoursesSection}>
                    <h2 className={styles.sectionTitle}>Sprays</h2>
                    <div className={styles.coursesGrid}>
                        {sprayCourses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/cursos/${course.id}`}
                                className={styles.courseCard}
                            >
                                <Image
                                    width={200}
                                    height={200}
                                    src={course.image}
                                    alt={course.title}
                                    className={styles.courseImage}
                                />
                                <h3 className={styles.courseTitle}>{course.title}</h3>
                                <p className={styles.courseAuthor}>{course.description}</p>
                                <p className={styles.coursePrice}>{course.price} €</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
