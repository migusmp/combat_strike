import styles from "../css/Carrusel.module.css";
import { useState } from "react";
import { courses as allCourses } from "../../../lib/mockData";
import Link from "next/link";

type Course = typeof allCourses[number];

export default function Carrusel() {
    const [activeTab, setActiveTab] = useState("Recomendado");

    const tabs = ["Recomendado", "Krav Maga", "Sprays"];

    // Función para filtrar los cursos según la tab
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

    return (
        <div className={styles.carruselContainer}>
            <div className={styles.menuContainer}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`${styles.tabButton} ${activeTab === tab ? styles.active : ""
                            }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className={styles.coursesGrid}>
                {courses.map((course) => (
                    <Link
                        key={course.id}
                        href={`/cursos/${course.id}`}
                        className={styles.courseCard}
                    >
                        <img
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
    );
}
