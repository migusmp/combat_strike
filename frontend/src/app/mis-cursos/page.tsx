"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "../components/Home/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuthContext } from "../context/AuthContext";
import usePurchasedCourses from "../hooks/usePurchasedCourses";
import styles from "./MyCourses.module.css";

const FALLBACK_IMAGE = "/assets/foto-curso-krav-maga.png";

const formatDate = (isoDate?: string) => {
    if (!isoDate) return "—";
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function MyCoursesPage() {
    const router = useRouter();
    const { isAuthenticated, checkingAuth } = useAuthContext();
    const {
        courses: purchasedCourses,
        isLoading,
        error,
    } = usePurchasedCourses();

    useEffect(() => {
        if (!checkingAuth && !isAuthenticated) {
            router.replace("/");
        }
    }, [checkingAuth, isAuthenticated, router]);

    if (checkingAuth || !isAuthenticated) {
        return (
            <div style={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <LoadingSpinner />
            </div>
        );
    }

    const enrichedCourses = useMemo(() => {
        if (!purchasedCourses || purchasedCourses.length === 0) return [];

        return purchasedCourses
            .filter((purchase) => purchase.course)
            .map((purchase) => {
                const course = purchase.course!;
                const rawProgress = (course as any).progress;
                const normalizedProgress =
                    typeof rawProgress === "number"
                        ? Math.min(100, Math.max(0, Math.round(rawProgress)))
                        : 0;

                return {
                    id: course.id ?? purchase.purchaseId,
                    title: course.title ?? "Curso sin título",
                    category: course.category ?? "Curso táctico",
                    image: course.image ?? FALLBACK_IMAGE,
                    progress: normalizedProgress,
                    description: course.description ?? "",
                    purchaseDate: purchase.purchasedAt,
                    paymentStatus: purchase.status ?? "Pago completado",
                };
            });
    }, [purchasedCourses]);

    const inProgress = enrichedCourses.filter((course) => course.progress < 100);
    const completed = enrichedCourses.filter((course) => course.progress >= 100);

    const summary = {
        active: inProgress.length,
        completed: completed.length,
        total: enrichedCourses.length,
        hours: enrichedCourses.length > 0 ? `${Math.max(1, enrichedCourses.length * 5)} h aprox` : "—",
    };

    return (
        <>
            <div className={styles.wrapper}>
                <div className={styles.content}>
                    <section className={styles.hero}>
                        <div className={styles.heroContent}>
                            <span className={styles.heroEyebrow}>Tu entrenamiento</span>
                            <h1>Mis cursos activos ⚡</h1>
                            <p>
                                Continúa donde lo dejaste, celebra tus logros y desbloquea nuevas misiones avanzando a tu
                                ritmo.
                            </p>
                            <div className={styles.heroActions}>
                                <Link href="/cursos" className={styles.heroPrimary}>
                                    Explorar catálogo
                                </Link>
                                <Link href="/agenda" className={styles.heroSecondary}>
                                    Ver agenda táctica
                                </Link>
                            </div>
                        </div>
                        <div className={styles.progressSummary}>
                            <h3>Estado general</h3>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryCard}>
                                    <span>Cursos en progreso</span>
                                    <strong>{summary.active}</strong>
                                </div>
                                <div className={styles.summaryCard}>
                                    <span>Completados</span>
                                    <strong>{summary.completed}</strong>
                                </div>
                                <div className={styles.summaryCard}>
                                    <span>Total adquiridos</span>
                                    <strong>{summary.total}</strong>
                                </div>
                                <div className={styles.summaryCard}>
                                    <span>Horas registradas</span>
                                    <strong>{summary.hours}</strong>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Siguiendo ahora</h2>
                            <small>Completa tus misiones activas antes de 72h para retener elasticidad.</small>
                        </div>
                        {isLoading && <p className={styles.emptyState}>Sincronizando tus cursos...</p>}
                        {error && !isLoading && (
                            <p className={styles.emptyState}>{error}</p>
                        )}
                        {!isLoading && !error && inProgress.length === 0 && (
                            <p className={styles.emptyState}>
                                No tienes cursos en marcha. Revisa el catálogo para iniciar un nuevo entrenamiento.
                            </p>
                        )}
                        {!isLoading && inProgress.length > 0 && (
                            <div className={styles.courseGrid}>
                                {inProgress.map((course) => (
                                    <Link key={course.id} href={`/cursos/${course.id}`} className={styles.courseCard}>
                                        <div className={styles.courseThumb}>
                                            <Image
                                                src={course.image}
                                                alt={course.title}
                                                fill
                                                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 320px"
                                            />
                                        </div>
                                        <h3>{course.title}</h3>
                                        <div className={styles.metaRow}>
                                            <span>{course.category}</span>
                                            <span>{course.progress}%</span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div className={styles.progressFill} style={{ width: `${course.progress}%` }} />
                                        </div>
                                        <div className={styles.courseFooter}>
                                            <span>Comprado: {formatDate(course.purchaseDate)}</span>
                                            <span>Pago: {course.paymentStatus}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Completados</h2>
                            <small>Revisa el contenido clave o comparte tus logros con tu equipo.</small>
                        </div>
                        {completed.length === 0 ? (
                            <p className={styles.emptyState}>
                                Aún no tienes cursos completados. Mantén tu ritmo y desbloquea tu primera insignia.
                            </p>
                        ) : (
                            <div className={styles.courseGrid}>
                                {completed.map((course) => (
                                    <Link key={course.id} href={`/cursos/${course.id}`} className={styles.courseCard}>
                                        <div className={styles.courseThumb}>
                                            <Image
                                                src={course.image}
                                                alt={course.title}
                                                fill
                                                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 320px"
                                            />
                                        </div>
                                        <h3>{course.title}</h3>
                                        <div className={styles.metaRow}>
                                            <span>{course.category}</span>
                                            <span>100%</span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div className={styles.progressFill} style={{ width: "100%" }} />
                                        </div>
                                        <div className={styles.courseFooter}>
                                            <span>Comprado: {formatDate(course.purchaseDate)}</span>
                                            <span>Pago: {course.paymentStatus}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}
