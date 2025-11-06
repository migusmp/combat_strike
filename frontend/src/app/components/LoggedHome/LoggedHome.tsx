// components/LoggedHome.tsx
import Link from "next/link";
import Image from "next/image";
import Footer from "../Home/Footer";
import styles from "./css/LoggedHome.module.css";
import { useAuthContext } from "@/app/context/AuthContext";

const inProgressCourses = [
    {
        id: 1,
        title: "Defensa Personal Intensiva",
        category: "Krav Maga",
        progress: 68,
        lastLesson: "Bloque 3 · Técnicas de escape",
        nextLesson: "Práctica guiada de respuestas rápidas",
        image: "/assets/foto-curso-krav-maga.png",
    },
    {
        id: 2,
        title: "Uso Seguro de Sprays de Defensa",
        category: "Táctico",
        progress: 42,
        lastLesson: "Mecánica de activación",
        nextLesson: "Simulación en exterior",
        image: "/assets/foto-curso-gas-pimienta.png",
    },
];

const recommendedCourses = [
    {
        id: 3,
        title: "Protocolos de Autoprotección Urbana",
        duration: "1 h 40 min",
        image: "/assets/foto-curso-krav-maga-avanzado.png",
    },
    {
        id: 4,
        title: "Boxeo aplicado a situaciones reales",
        duration: "55 min",
        image: "/assets/foto-curso-krav-maga.png",
    },
];

const achievements = [
    { id: 1, label: "Rutina semanal completada", date: "Hace 2 días" },
    { id: 2, label: "100% del curso Defensa Personal Femenina", date: "Hace 1 semana" },
    { id: 3, label: "Participaste en el taller presencial", date: "Hace 3 semanas" },
];

export default function LoggedHome() {
    const { user } = useAuthContext();
    const userName = user?.name ?? "Combatiente";
    const currentCourse = inProgressCourses[0];

    return (
        <>
            <div className={styles.dashboardWrapper}>
                <section className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <span className={styles.sectionEyebrow}>Tu espacio en Combat Strike</span>
                        <h1>Hola, {userName} 👋</h1>
                        <p>
                            Continúa donde lo dejaste, revisa tu progreso y explora nuevos desafíos que hemos
                            preparado para ti.
                        </p>
                        <div className={styles.statsGrid}>
                            <article>
                                <strong>42 h</strong>
                                <span>Tiempo total de práctica</span>
                            </article>
                            <article>
                                <strong>6</strong>
                                <span>Cursos en progreso</span>
                            </article>
                            <article>
                                <strong>87%</strong>
                                <span>Compromiso mensual</span>
                            </article>
                        </div>
                    </div>
                    <div className={styles.currentCourseCard}>
                        <span className={styles.sectionEyebrow}>Continuar viendo</span>
                        <div className={styles.currentCourseVisual}>
                            <Image
                                src={currentCourse.image}
                                alt={currentCourse.title}
                                fill
                                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 340px"
                                className={styles.currentCourseImage}
                            />
                            <span className={styles.currentCourseCategory}>{currentCourse.category}</span>
                        </div>
                        <h2>{currentCourse.title}</h2>
                        <p className={styles.currentCourseLesson}>Última lección: {currentCourse.lastLesson}</p>
                        <div className={styles.progressBar}>
                            <div style={{ width: `${currentCourse.progress}%` }} />
                        </div>
                        <div className={styles.currentCourseFooter}>
                            <span>{currentCourse.progress}% completado</span>
                            <Link href={`/cursos/${currentCourse.id}`} className={styles.primaryBtn}>
                                Reanudar
                            </Link>
                        </div>
                    </div>
                </section>

                <section className={styles.progressSection}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionEyebrow}>Tu avance</span>
                        <h2>Cursos en progreso</h2>
                        <p>Retoma los módulos pendientes y mantén la constancia.</p>
                    </div>
                    <div className={styles.courseList}>
                        {inProgressCourses.map(course => (
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

                <section className={styles.recommendSection}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionEyebrow}>Sigue aprendiendo</span>
                        <h2>Recomendados para ti</h2>
                        <p>Basado en tu ritmo y cursos anteriores.</p>
                    </div>
                    <div className={styles.recommendGrid}>
                        {recommendedCourses.map(course => (
                            <article key={course.id} className={styles.recommendCard}>
                                <Image
                                    src={course.image}
                                    alt={course.title}
                                    width={180}
                                    height={120}
                                />
                                <div>
                                    <h3>{course.title}</h3>
                                    <span>{course.duration}</span>
                                </div>
                                <Link href={`/cursos/${course.id}`}>Ver detalles</Link>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.feedSection}>
                    <div className={styles.feedHeader}>
                        <span className={styles.sectionEyebrow}>Resumen reciente</span>
                        <h2>Tu actividad</h2>
                    </div>
                    <ul className={styles.feedList}>
                        {achievements.map(item => (
                            <li key={item.id}>
                                <span>{item.label}</span>
                                <small>{item.date}</small>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
            <Footer />
        </>
    );
}
