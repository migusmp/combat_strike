import styles from "../css/Carrusel.module.css";
import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import useCourses from "@/app/hooks/useCourses";
import { Course } from "@/app/interfaces/courses";
import { useAuthContext } from "@/app/context/AuthContext";

/**
 * Componente Carrusel
 *
 * Muestra los cursos organizados por categorías (Todos, Krav Maga, Sprays)
 * obtenidos dinámicamente desde el backend usando el hook `useCourses()`.
 *
 * Incluye:
 * - Menú de pestañas dinámico
 * - Bloques por categoría
 * - Listas de cursos filtradas por tipo
 */
export default function Carrusel() {
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState("Todos");

  // Hook personalizado para obtener los cursos desde el backend
  const { courses, isLoading, error } = useCourses();
  const { isAuthenticated, purchasedCourses } = useAuthContext();

  const ownedCourseIds = useMemo(() => {
    if (!purchasedCourses) return new Set<number>();

    return new Set(
      purchasedCourses
        .map((purchase) => purchase.course?.id)
        .filter((id): id is number => typeof id === "number"),
    );
  }, [purchasedCourses]);

  // Pestañas disponibles en el carrusel
  const tabs = ["Todos", "Krav Maga", "Sprays"];

  /**
   * Filtra los cursos según la pestaña activa.
   * @param tab - Nombre de la pestaña seleccionada.
   */
  const getCoursesByTab = (tab: string): Course[] => {
    if (!courses) return [];

    switch (tab) {
      case "Todos":
        return courses;
      case "Krav Maga":
        return courses.filter((c) => c.category === "Defensa Personal");
      case "Sprays":
        return courses.filter((c) => c.category === "Sprays");
      default:
        return [];
    }
  };

  // Cursos filtrados por pestaña activa
  const filteredCourses = getCoursesByTab(activeTab);

  // Cursos adicionales por categoría
  const personalDefenseCourses = courses?.filter(
    (c) => c.category === "Defensa Personal",
  );
  const sprayCourses = courses?.filter((c) => c.category === "Sprays");

  // 🔄 Estados de carga o error
  if (isLoading) return <p className={styles.loading}>Cargando cursos...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (!courses || courses.length === 0)
    return <p className={styles.empty}>No hay cursos disponibles.</p>;

  const renderCourseCard = (course: Course) => {
    const isOwned = isAuthenticated && ownedCourseIds.has(course.id);

    return (
      <Link key={course.id} href={`/cursos/${course.id}`} className={styles.courseCard}>
        <div className={styles.imageWrapper}>
          <Image
            src={course.image}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 320px"
            className={styles.courseImage}
          />
        </div>
        <h3 className={styles.courseTitle}>{course.title}</h3>
        <p className={styles.courseAuthor}>{course.description}</p>
        <div className={styles.courseMeta}>
          <p className={styles.coursePrice}>{course.price} €</p>
          {isOwned && <span className={styles.ownedBadge}>Obtenido</span>}
        </div>
      </Link>
    );
  };

  return (
    <div className={styles.carruselContainer}>
      {/* Menú de Tabs */}
      <div className={styles.menuContainer}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${
              activeTab === tab ? styles.active : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ✅ Encabezado dinámico según la pestaña activa */}
      <h2 className={styles.sectionTitle}>
        {activeTab === "Todos" && "Todos los cursos"}
        {activeTab === "Krav Maga" && "Cursos de Krav Maga"}
        {activeTab === "Sprays" && "Cursos de Sprays"}
      </h2>

      {/* 📚 Cursos filtrados según la pestaña */}
      <div className={styles.coursesGrid}>{filteredCourses.map(renderCourseCard)}</div>

      {/* 🥋 Cursos de Defensa Personal */}
      {personalDefenseCourses && personalDefenseCourses.length > 0 && (
        <div className={styles.newCoursesSection}>
          <h2 className={styles.sectionTitle}>Defensa Personal</h2>
          <div className={styles.coursesGrid}>{personalDefenseCourses.map(renderCourseCard)}</div>
        </div>
      )}

      {/* 🧴 Cursos de Sprays */}
      {sprayCourses && sprayCourses.length > 0 && (
        <div className={styles.newCoursesSection}>
          <h2 className={styles.sectionTitle}>Sprays</h2>
          <div className={styles.coursesGrid}>{sprayCourses.map(renderCourseCard)}</div>
        </div>
      )}
    </div>
  );
}
