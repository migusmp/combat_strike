"use client";

import { useState } from "react";
import CourseCard from '../components/Home/CourseCard';
import Footer from '../components/Home/Footer';
import styles from '../css/Cursos.module.css';
import { CategoryMenu } from "../components/Home/CategoryMenu";

export default function CursosPage() {
    const courses = [
        {
            id: "sprays",
            photo: "/assets/foto-curso-gas-pimienta.png",
            title: "Curso con Spray",
            topics: ["TIPOS DE SPRAY", "USO DEL SPRAY", "SITUACIONES SPRAY"],
            price: "59,99€",
            category: "Sprays",
        },
        {
            id: "krav-maga",
            photo: "/assets/foto-curso-krav-maga.png",
            title: "Krav Maga básico",
            topics: ["Técnicas de defensa básica", "Situaciones cotidianas"],
            price: "39,99€",
            category: "Krav Maga",
        },
        {
            id: "krav-maga-avanzado",
            photo: "/assets/foto-curso-krav-maga-avanzado.png",
            title: "Krav Maga avanzado",
            topics: ["Técnicas de defensa avanzada", "Uso de armas improvisadas"],
            price: "49,99€",
            category: "Krav Maga",
        },
        {
            id: "krav-maga-sda",
            photo: "/assets/foto-curso-krav-maga.png",
            title: "Krav Maga básico",
            topics: ["Técnicas de defensa básica", "Situaciones cotidianas"],
            price: "39,99€",
            category: "Krav Maga",
        },
        {
            id: "krav-maga-ds",
            photo: "/assets/foto-curso-krav-maga-avanzado.png",
            title: "Krav Maga avanzado",
            topics: ["Técnicas de defensa avanzada", "Uso de armas improvisadas"],
            price: "49,99€",
            category: "Krav Maga",
        },
    ];

    // Extraer categorías únicas
    const categories = ["Todos", ...Array.from(new Set(courses.map(c => c.category)))];
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    // Filtrar cursos por categoría seleccionada
    const filteredCourses = selectedCategory === "Todos"
        ? courses
        : courses.filter(c => c.category === selectedCategory);

    return (
        <>
            <div className={styles.container}>
                <article className={styles.coursesSection}>
                    {/* <h2 className={styles.sectionTitle}>Nuestros Cursos</h2> */}

                    {/* Menú de categorías */}
                    <CategoryMenu
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                    />

                    <div className={styles.coursesGrid}>
                        {filteredCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                id={course.id}
                                photo={course.photo}
                                title={course.title}
                                topics={course.topics}
                                price={course.price}
                            />
                        ))}
                    </div>
                </article>
            </div>
            <Footer />
        </>
    );
}
