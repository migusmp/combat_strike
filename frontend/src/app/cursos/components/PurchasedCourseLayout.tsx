"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../css/PurchasedCourse.module.css";
import { Course } from "@/app/interfaces/courses";
import { PurchasedCourse } from "@/app/interfaces/purchases";
import CourseContent from "./CourseContent";
import WhatYouWillLearn from "./WhatYouWillLearnSection";
import CourseDescription from "./CourseDescription";
import CourseRequirements from "./CourseRequirements";
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

    const scrollToContent = () => {
        contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const previewClips = useMemo(() => buildPreviewClips(course), [course]);
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    const previewSrc = `${baseUrl}/courses/${course.id}/preview/playlist`;
    const fullCourseSrc = `${baseUrl}/courses/${course.id}/full/playlist`;

    return (
        <div className={styles.wrapper}>
            <section className={styles.hero}>
                <div className={styles.mediaColumn}>
                    <div className={styles.previewMedia}>
                        <Image
                            src={course.image}
                            alt={`Vista previa de ${course.title}`}
                            fill
                            sizes="(max-width: 768px) 90vw, 800px"
                            className={styles.previewImage}
                        />
                        <div className={styles.previewOverlay}>
                            <span className={styles.overlayTag}>Curso completo</span>
                            <h2>Reproduce las sesiones al instante</h2>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={() => setShowFullCourseModal(true)}
                            >
                                Ver curso completo
                            </button>
                        </div>
                    </div>
                    <div className={styles.previewMeta}>
                        <p>
                            Abre el curso completo, navega por todas las secciones y activa subtítulos para repasar cada
                            detalle. Si prefieres un adelanto, lanza la vista rápida y vuelve a la acción en segundos.
                        </p>
                        <div className={styles.previewActions}>
                            <button type="button" className={styles.secondaryButton} onClick={() => setShowPreviewModal(true)}>
                                Vista rápida
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.heroContent}>
                    <span className={styles.badge}>Tu entrenamiento</span>
                    <h1 className={styles.title}>{course.title}</h1>
                    <p className={styles.subtitle}>
                        Accede a todo el material del curso, haz seguimiento de tu progreso y retoma las lecciones desde
                        cualquier dispositivo.
                    </p>
                    <div className={styles.heroActions}>
                        <button type="button" className={styles.primaryButton} onClick={scrollToContent}>
                            Ver contenido
                        </button>
                        <Link href="/mis-cursos" className={styles.secondaryButton}>
                            Volver a mis cursos
                        </Link>
                    </div>

                    <div className={styles.progressCard}>
                        <div className={styles.progressHeader}>
                            <span>Progreso</span>
                            <strong>{progress}%</strong>
                        </div>
                        <div className={styles.progressBar}>
                            <span className={styles.progressValue} style={{ width: `${progress}%` }} />
                        </div>
                        <p className={styles.progressFooter}>
                            {totalSections} secciones · {totalClasses} lecciones
                        </p>
                    </div>

                    <div className={styles.purchaseSummary}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Fecha de compra</span>
                            <strong>{purchaseDate}</strong>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Estado</span>
                            <strong>{statusLabel}</strong>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Proveedor</span>
                            <strong>{providerLabel}</strong>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Importe</span>
                            <strong>{amountLabel}</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.body}>
                <div className={styles.mainColumn} ref={contentRef}>
                    <CourseContent courseId={course.id} />
                    <WhatYouWillLearn points={course.whatYouWillLearn} />
                    <CourseDescription text={course.longDescription} maxLength={600} />
                    <CourseRequirements requirements={course.requirements} />
                </div>

                <aside className={styles.sidebar}>
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
                                <dt>Estado</dt>
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
    );
}
