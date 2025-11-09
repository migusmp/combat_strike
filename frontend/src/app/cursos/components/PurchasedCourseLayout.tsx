"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/app/components/Home/Footer";
import styles from "../css/PurchasedCourse.module.css";
import { Course } from "@/app/interfaces/courses";
import { PurchasedCourse } from "@/app/interfaces/purchases";
import CoursePreviewModal from "./CoursePreviewModal";
import FullCoursePreviewModal from "./FullCoursePreviewModal";
import { buildPreviewClips } from "../utils/previewClips";

interface PurchasedCourseLayoutProps {
    course: Course;
    purchase?: PurchasedCourse;
}

const formatDate = (value?: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function PurchasedCourseLayout({ course, purchase }: PurchasedCourseLayoutProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showFullCourseModal, setShowFullCourseModal] = useState(false);

    const purchaseDate = formatDate(purchase?.purchasedAt);
    const statusLabel = purchase?.status ?? "Pago completado";
    const providerLabel = purchase?.provider ?? "—";
    const orderId = purchase?.externalOrderId ?? "—";
    const amountLabel =
        typeof purchase?.amount === "number" ? `${purchase.amount.toFixed(2)} €` : `${course.price} €`;

    const progress = useMemo(() => {
        const raw = (purchase?.course as unknown as { progress?: number } | undefined)?.progress;
        if (typeof raw !== "number") {
            return statusLabel === "COMPLETED" ? 100 : 0;
        }
        return Math.min(100, Math.max(0, Math.round(raw)));
    }, [purchase?.course, statusLabel]);

    const totalSections = course.content.length;
    const totalClasses = course.content.reduce((sum, section) => sum + section.classes.length, 0);
    const totalMinutes = course.content.reduce((minutes, section) => {
        section.classes.forEach((cls) => {
            minutes += cls.duration.hours * 60 + cls.duration.minutes;
        });
        return minutes;
    }, 0);
    const durationHours = Math.floor(totalMinutes / 60);
    const durationMinutes = totalMinutes % 60;

    const scrollToContent = () => {
        contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const previewClips = useMemo(() => buildPreviewClips(course), [course]);
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    const previewSrc = `${baseUrl}/courses/${course.id}/preview/playlist`;
    const fullCourseSrc = `${baseUrl}/courses/${course.id}/full/playlist`;

    return (
        <>
        <div className={styles.wrapper}>
            <section className={styles.videoHero}>
                <div className={styles.videoShell}>
                    <Image
                        src={course.image}
                        alt={`Portada de ${course.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 1200px"
                        className={styles.heroImage}
                        priority
                    />
                    <div className={styles.videoOverlay}>
                        <span className={styles.badge}>Curso adquirido</span>
                        <h1>{course.title}</h1>
                        <p>Reproduce el curso completo, activa subtítulos y cambia de módulo cuando quieras.</p>
                        <div className={styles.heroButtons}>
                            <button type="button" className={styles.primaryButtonLarge} onClick={() => setShowFullCourseModal(true)}>
                                Ver curso completo
                            </button>
                            <button type="button" className={styles.secondaryGhost} onClick={() => setShowPreviewModal(true)}>
                                Ver vista rápida
                            </button>
                            <button type="button" className={styles.softButton} onClick={scrollToContent}>
                                Ir al contenido
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.infoGrid}>
                <article className={styles.infoCardWide}>
                    <header>
                        <span>Progreso actual</span>
                        <strong>{progress}%</strong>
                    </header>
                    <div className={styles.progressTrack}>
                        <span style={{ width: `${progress}%` }} />
                    </div>
                    <footer>
                        {totalSections} secciones · {totalClasses} clases
                    </footer>
                </article>

                <article className={styles.infoCardCompact}>
                    <span>Resumen de compra</span>
                    <dl>
                        <div>
                            <dt>Fecha</dt>
                            <dd>{purchaseDate}</dd>
                        </div>
                        <div>
                            <dt>Pago</dt>
                            <dd>{statusLabel}</dd>
                        </div>
                        <div>
                            <dt>Proveedor</dt>
                            <dd>{providerLabel}</dd>
                        </div>
                        <div>
                            <dt>Importe</dt>
                            <dd>{amountLabel}</dd>
                        </div>
                    </dl>
                </article>

                <article className={styles.infoCardCompact}>
                    <span>Acciones rápidas</span>
                    <div className={styles.quickActions}>
                        <Link href="/mis-cursos">Volver a mis cursos</Link>
                        <button type="button" onClick={scrollToContent}>
                            Ver temario
                        </button>
                    </div>
                </article>
            </section>

            <section className={styles.trainingPanels} ref={contentRef}>
                <div className={styles.panelStack}>
                    <article className={`${styles.panelCard} ${styles.panelGradient}`}>
                        <header>
                            <span className={styles.panelTag}>Plan de entrenamiento</span>
                            <h2>Contenido del curso</h2>
                            <p>
                                {totalSections} secciones · {totalClasses} clases · {durationHours} h {durationMinutes} min
                            </p>
                        </header>
                        <ul className={styles.sectionList}>
                            {course.content.map((section) => (
                                <li key={section.sectionTitle} className={styles.sectionItem}>
                                    <details>
                                        <summary>
                                            <div>
                                                <strong>{section.sectionTitle}</strong>
                                                <span>{section.classes.length} clases</span>
                                            </div>
                                            <span aria-hidden="true">▼</span>
                                        </summary>
                                        <div className={styles.sectionClasses}>
                                            {section.classes.map((cls, idx) => (
                                                <div key={`${section.sectionTitle}-${idx}`}>
                                                    <p>{cls.title}</p>
                                                    <span>
                                                        {cls.duration.hours ? `${cls.duration.hours} h ` : ""}
                                                        {cls.duration.minutes} min
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </li>
                            ))}
                        </ul>
                    </article>

                    <article className={styles.panelCard}>
                        <header>
                            <span className={styles.panelTag}>Resultados</span>
                            <h2>Lo que aprenderás</h2>
                            <p>Competencias clave que consolidarás durante el curso.</p>
                        </header>
                        <ul className={styles.learnList}>
                            {course.whatYouWillLearn?.map((item, index) => (
                                <li key={index}>
                                    <span />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </article>

                    <article className={styles.panelCard}>
                        <header>
                            <span className={styles.panelTag}>Antes de comenzar</span>
                            <h2>Requisitos recomendados</h2>
                            <p>Prepara tu equipo para aprovechar el entrenamiento.</p>
                        </header>
                        <ul className={styles.requireList}>
                            {course.requirements?.map((req, index) => (
                                <li key={index}>{req}</li>
                            ))}
                        </ul>
                    </article>

                    <article className={styles.panelCard}>
                        <header>
                            <span className={styles.panelTag}>Descripción</span>
                            <h2>Profundiza en el programa</h2>
                        </header>
                        <p className={styles.descriptionCopy}>{course.longDescription}</p>
                    </article>
                </div>

                <aside className={styles.sidebarStack}>
                    <div className={styles.infoCard}>
                        <h3>Detalles de compra</h3>
                        <dl>
                            <div>
                                <dt>Código de pedido</dt>
                                <dd>{orderId}</dd>
                            </div>
                            <div>
                                <dt>Proveedor</dt>
                                <dd>{providerLabel}</dd>
                            </div>
                            <div>
                                <dt>Pago</dt>
                                <dd>{statusLabel}</dd>
                            </div>
                            <div>
                                <dt>Importe</dt>
                                <dd>{amountLabel}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className={styles.infoCard}>
                        <h3>Incluye</h3>
                        <ul className={styles.includesList}>
                            {course.includes.map((item, index) => (
                                <li key={index}>
                                    <span>✔</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.infoCard}>
                        <h3>Soporte</h3>
                        <p>
                            ¿Dudas sobre tu curso o el acceso? Escríbenos y te ayudaremos a continuar sin interrupciones.
                        </p>
                        <a href="mailto:soporte@combatstrike.com" className={styles.supportLink}>
                            Contactar soporte
                        </a>
                    </div>
                </aside>
            </section>

            {showPreviewModal && (
                <CoursePreviewModal
                    show={showPreviewModal}
                    onClose={() => setShowPreviewModal(false)}
                    courseTitle={course.title}
                    videoSrc={previewSrc}
                    videos={previewClips.length ? previewClips : [{ title: "Vista previa del curso", duration: "" }]}
                    course={course}
                />
            )}
            {showFullCourseModal && (
                <FullCoursePreviewModal
                    show={showFullCourseModal}
                    onClose={() => setShowFullCourseModal(false)}
                    course={course}
                    masterPlaylistSrc={fullCourseSrc}
                    apiBaseUrl={baseUrl}
                />
            )}
        </div>
        <Footer />
        </>
    );
}
