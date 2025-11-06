"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "../Home/Footer";
import styles from "./css/NewUserHome.module.css";
import { useAuthContext } from "@/app/context/AuthContext";
import useCourses from "@/app/hooks/useCourses";

const quickActions = [
    {
        eyebrow: "Paso 1",
        title: "Completa tu perfil táctico",
        description: "Ajusta tus intereses, nivel y objetivos para personalizar tus primeras misiones.",
        action: "Personalizar",
        href: "/perfil",
    },
    {
        eyebrow: "Paso 2",
        title: "Configura tu semana",
        description: "Elige los días y horarios donde vas a entrenar para recibir recordatorios.",
        action: "Planificar",
        href: "/agenda",
    },
    {
        eyebrow: "Paso 3",
        title: "Activa alertas de progreso",
        description: "Recibe notificaciones de checkpoints importantes en tu móvil.",
        action: "Activar",
        href: "/ajustes/notificaciones",
    },
];

const badgeHighlights = [
    {
        label: "Insignia en progreso",
        title: "Ritmo Constante",
        description: "Completa 3 días seguidos con check-in táctico.",
        status: "0 / 3 días",
    },
    {
        label: "Objetivo desbloqueable",
        title: "Briefing completado",
        description: "Ve el video inicial y responde al micro cuestionario.",
        status: "0 / 1 misión",
    },
];

const fallbackRecommendations = [
    {
        id: "starter-1",
        title: "Uso Seguro de Sprays de Defensa",
        description: "Perfecto si nunca has utilizado spray en escenarios reales.",
        meta: "45 min · Nivel iniciación",
        image: "/assets/foto-curso-gas-pimienta.png",
        category: "Sprays tácticos",
        href: "/cursos/1",
    },
    {
        id: "starter-2",
        title: "Autoprotección Urbana Esencial",
        description: "Aprende a leer el entorno y a moverte con intención.",
        meta: "1 h 10 min · Nivel iniciación",
        image: "/assets/foto-curso-krav-maga.png",
        category: "Autoprotección",
        href: "/cursos/2",
    },
    {
        id: "starter-3",
        title: "Plan de reacción rápida en casa",
        description: "Sesiones cortas para construir reflejos y agilidad.",
        meta: "30 min · Rutina express",
        image: "/assets/foto-curso-krav-maga-avanzado.png",
        category: "Entrenamiento físico",
        href: "/cursos/3",
    },
];

export default function NewUserHome() {
    const { user } = useAuthContext();
    const userName = user?.name ?? "Combatiente";
    const { courses, isLoading: coursesLoading, error: coursesError } = useCourses();

    const recommendedFromApi = (courses ?? []).slice(0, 3).map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        meta: course.price ? `${course.price} €` : course.category,
        image: course.image,
        category: course.category,
        href: `/cursos/${course.id}`,
    }));

    const recommendedCourses =
        recommendedFromApi.length > 0 ? recommendedFromApi : fallbackRecommendations;

    return (
        <>
            <div className={styles.wrapper}>
                <section className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <p className={styles.heroEyebrow}>Bienvenido a Combat Strike</p>
                        <h1 className={styles.heroGreeting}>¡Hola, {userName}! ⚡</h1>
                        <p className={styles.heroDescription}>
                            Hemos preparado un itinerario para que tus primeros días sean claros, motivantes y sin
                            fricciones. Completa las misiones rápidas y activa tu primera sesión práctica en minutos.
                        </p>
                        <div className={styles.heroActions}>
                            <Link href="/cursos" className={styles.primaryCTA}>
                                Comenzar mi primer curso
                            </Link>
                            <Link href="/briefing" className={styles.secondaryCTA}>
                                Ver briefing inicial
                            </Link>
                        </div>
                    </div>
                    <div className={styles.heroHighlights}>
                        <div className={styles.highlightItem}>
                            <span className={styles.sectionEyebrow}>Tu estado</span>
                            <strong>Modo inicio</strong>
                            <small>Configura tu perfil para recibir recomendaciones dinámicas.</small>
                        </div>
                        <div className={styles.highlightItem}>
                            <span className={styles.sectionEyebrow}>Próximo checkpoint</span>
                            <strong>3 misiones</strong>
                            <small>Desbloquea tu primera insignia completando los pasos sugeridos.</small>
                        </div>
                    </div>
                </section>

                <section className={styles.quickSection}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionEyebrow}>Primeros pasos</span>
                        <h2>Completa tu kit de entrada</h2>
                        <p className={styles.emptyStateNote}>
                            Cada paso desbloquea recomendaciones más precisas y un onboarding más rápido.
                        </p>
                    </div>
                    <div className={styles.actionsSection}>
                        {quickActions.map((item) => (
                            <article key={item.title} className={styles.actionCard}>
                                <span>{item.eyebrow}</span>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                                <Link href={item.href}>{item.action}</Link>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.badgesSection}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionEyebrow}>Insignias</span>
                        <h2>Recién estás arrancando</h2>
                        <p className={styles.emptyStateNote}>
                            Completa las micro misiones para desbloquear tu primera insignia antes de 72h.
                        </p>
                    </div>
                    <div className={styles.badgesGrid}>
                        {badgeHighlights.map((badge) => (
                            <article key={badge.title} className={styles.badgeCard}>
                                <span className={styles.pill}>{badge.label}</span>
                                <h3>{badge.title}</h3>
                                <p>{badge.description}</p>
                                <footer>
                                    <strong>{badge.status}</strong>
                                    <button type="button">Ver requisitos</button>
                                </footer>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.discoverySection}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionEyebrow}>Recomendados para empezar</span>
                        <h2>Cursos diseñados para tu primer contacto</h2>
                        <p className={styles.emptyStateNote}>
                            Elige uno para desbloquear tu primera insignia y registrar tu primer progreso.
                        </p>
                    </div>
                    {coursesLoading && (
                        <p className={styles.emptyStateNote}>Cargando cursos recomendados...</p>
                    )}
                    {coursesError && !coursesLoading && (
                        <p className={styles.emptyStateNote}>
                            No se pudieron cargar los cursos, te dejamos algunas sugerencias clave.
                        </p>
                    )}
                    <div className={styles.discoveryGrid}>
                        {recommendedCourses.map((course) => (
                            <article key={course.id} className={styles.discoveryCard}>
                                <div className={styles.discoveryMedia}>
                                    <Image
                                        src={course.image || "/assets/foto-curso-krav-maga.png"}
                                        alt={course.title}
                                        fill
                                        sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 280px"
                                        className={styles.discoveryImage}
                                    />
                                    {course.category && (
                                        <span className={styles.discoveryChip}>{course.category}</span>
                                    )}
                                </div>
                                <div className={styles.discoveryBody}>
                                    <h3>{course.title}</h3>
                                    <p>{course.description}</p>
                                    <footer>
                                        <span>{course.meta}</span>
                                        <Link href={course.href}>Explorar →</Link>
                                    </footer>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
