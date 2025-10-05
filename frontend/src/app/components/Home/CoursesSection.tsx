"use client";
import { useState } from "react";
import styles from "../../css/CoursesSection.module.css";
import CourseCard from "./CourseCard";
import { CategoryMenu } from "./CategoryMenu";

export default function CoursesSection() {
    const courses = [
        {
            id: "sprays",
            photo: "/assets/foto-curso-gas-pimienta.png",
            title: "Curso con Spray",
            topics: ["TIPOS DE SPRAY", "USO DEL SPRAY", "SITUACIONES SPRAY"],
            category: "Sprays",
            price: "59,99€",
        },
        {
            id: "krav-maga",
            photo: "/assets/foto-curso-krav-maga.png",
            title: "Como manejarse en situaciones cotidianas sin materiales",
            topics: ["Aprende técnicas sin necesidad de material", "Defensa en situaciones reales"],
            category: "Krav Maga",
            price: "39,99€",
        },
        {
            id: "krav-maga",
            photo: "/assets/foto-curso-krav-maga-avanzado.png",
            title: "Defensa personal avanzada",
            topics: ["Técnicas de defensa", "Uso de armas improvisadas"],
            category: "Krav Maga",
            price: "49,99€",
        }
    ];

    const categories = ["Todos", ...Array.from(new Set(courses.map(c => c.category)))];
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    const filteredCourses = selectedCategory === "Todos"
        ? courses
        : courses.filter(c => c.category === selectedCategory);

    return (
        <section className={styles.coursesSection}>
            <h2 className={styles.sectionTitle}>Nuestros Cursos</h2>

            <CategoryMenu
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
            />

            <div className={styles.coursesContainer}>
                {filteredCourses.map((course, index) => (
                    <CourseCard id={course.id} key={index} title={course.title} topics={course.topics} price={course.price} photo={course.photo}/>
                ))}
            </div>
        </section>
    );
}
