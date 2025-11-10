"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Footer from "@/app/components/Home/Footer";
import styles from "../css/PurchasedCourseLayout.module.css";
import { Course } from "@/app/interfaces/courses";
import { PurchasedCourse } from "@/app/interfaces/purchases";
import CoursePreviewModal from "./CoursePreviewModal";
import FullCoursePreviewModal from "./FullCoursePreviewModal";
import { buildPreviewClips } from "../utils/previewClips";
import { useFullCoursePreview } from "../hooks/useFullCoursePreview";
import MobilePurchasedCourseContent from "./MobilePurchasedCourseContent";

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
    const [isCompact, setIsCompact] = useState(false);

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

    useEffect(() => {
        const updateCompact = () => {
            if (typeof window === "undefined") return;
            setIsCompact(window.innerWidth <= 768);
        };
        updateCompact();
        window.addEventListener("resize", updateCompact);
        return () => window.removeEventListener("resize", updateCompact);
    }, []);

    const {
        sections,
        selectedSection,
        selectedClass,
        currentSection,
        currentClass,
        currentSectionSlug,
        currentClassSlug,
        currentSubtitles,
        videoRef,
        handleSelect,
    } = useFullCoursePreview({
        course,
        masterPlaylistSrc: fullCourseSrc,
        apiBaseUrl: baseUrl,
        active: true,
    });

    const viewerClassName = [styles.viewerBlock, isCompact ? styles.viewerBlockFullBleed : ""]
        .filter(Boolean)
        .join(" ")
        .trim();

    return (
        <>
        <div className={styles.wrapper}>
            <div ref={contentRef} className={viewerClassName}>
                {isCompact ? (
                    <MobilePurchasedCourseContent
                        course={course}
                        sections={sections}
                        selectedSection={selectedSection}
                        selectedClass={selectedClass}
                        currentSection={currentSection}
                        currentClass={currentClass}
                        videoRef={videoRef}
                        currentSectionSlug={currentSectionSlug}
                        currentClassSlug={currentClassSlug}
                        currentSubtitles={currentSubtitles}
                        baseUrl={baseUrl}
                        onSelect={handleSelect}
                        progress={progress}
                        totalSections={totalSections}
                        totalClasses={totalClasses}
                        durationHours={durationHours}
                        durationMinutes={durationMinutes}
                    />
                ) : (
                    <section className={styles.fullCourseLayout}>
                        <div className={styles.playerColumn}>
                            <div className={styles.playerShell}>
                                <video
                                    ref={videoRef}
                                    controls
                                    crossOrigin="use-credentials"
                                    className={styles.playerVideo}
                                >
                                    {currentSectionSlug &&
                                        currentClassSlug &&
                                        currentSubtitles.map((subtitle, idx) => (
                                            <track
                                                key={`${subtitle.file}-${idx}`}
                                                kind="subtitles"
                                                src={`${baseUrl}/courses/${course.id}/full/${currentSectionSlug}/${currentClassSlug}/subtitles/${subtitle.file}`}
                                                srcLang={subtitle.lang}
                                                label={subtitle.label}
                                                default={subtitle.lang === "es"}
                                            />
                                        ))}
                                </video>
                            </div>
                            <div className={styles.playerMeta}>
                                <p className={styles.playerEyebrow}>Reproduciendo</p>
                                <h3>
                                    {currentSection ? currentSection.sectionTitle : "Sin secciones"}{" "}
                                    {currentClass ? `· ${currentClass.title}` : ""}
                                </h3>
                                {currentClass && (
                                    <span>
                                        {currentClass.duration.hours > 0 ? `${currentClass.duration.hours} h ` : ""}
                                        {currentClass.duration.minutes} min
                                    </span>
                                )}
                            </div>
                            <div className={styles.playerActions}>
                                <button type="button" className={styles.secondaryGhost} onClick={() => setShowPreviewModal(true)}>
                                    Ver vista rápida
                                </button>
                                <button type="button" className={styles.softButton} onClick={() => setShowFullCourseModal(true)}>
                                    Abrir en ventana
                                </button>
                            </div>
                        </div>

                        <aside className={styles.sectionSidebar}>
                            <header>
                                <span className={styles.panelTag}>Plan de entrenamiento</span>
                                <h2>Contenido del curso</h2>
                                <p>
                                    {totalSections} secciones · {totalClasses} clases · {durationHours} h {durationMinutes} min
                                </p>
                            </header>
                            <div className={styles.sectionModuleList}>
                                {sections.map((section, sectionIdx) => (
                                    <div key={section.sectionTitle} className={styles.sectionModule}>
                                        <button
                                            type="button"
                                            className={`${styles.sectionModuleHeader} ${
                                                selectedSection === sectionIdx ? styles.sectionModuleHeaderActive : ""
                                            }`}
                                            onClick={() => handleSelect(sectionIdx, 0)}
                                        >
                                            <div>
                                                <strong>{section.sectionTitle}</strong>
                                                <span>{section.classes.length} clases</span>
                                            </div>
                                            <span className={styles.sectionModuleIcon} aria-hidden="true">
                                                ▶
                                            </span>
                                        </button>
                                        <ul className={styles.sectionClassList}>
                                            {section.classes.map((cls, classIdx) => {
                                                const isActive = selectedSection === sectionIdx && selectedClass === classIdx;
                                                return (
                                                    <li key={`${section.sectionTitle}-${classIdx}`}>
                                                        <button
                                                            type="button"
                                                            className={`${styles.sectionClassButton} ${
                                                                isActive ? styles.sectionClassButtonActive : ""
                                                            }`}
                                                            onClick={() => handleSelect(sectionIdx, classIdx)}
                                                        >
                                                            <span>{classIdx + 1}.</span>
                                                            <div>
                                                                <p>{cls.title}</p>
                                                                <small>
                                                                    {cls.duration.hours > 0 ? `${cls.duration.hours} h ` : ""}
                                                                    {cls.duration.minutes} min
                                                                </small>
                                                            </div>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </section>
                )}
            </div>

            {!isCompact && (
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
            )}

            {!isCompact && (
            <section className={styles.trainingPanels}>
                <div className={styles.panelStack}>
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
            )}

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
        </>
    );
}
