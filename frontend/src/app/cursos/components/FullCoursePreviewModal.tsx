"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import styles from "../css/FullCoursePreviewModal.module.css";
import { Course } from "@/app/interfaces/courses";

interface FullCoursePreviewModalProps {
    show: boolean;
    onClose: () => void;
    course: Course;
    masterPlaylistSrc: string;
    apiBaseUrl: string;
}

const slugFromTitle = (value?: string) =>
    (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

export default function FullCoursePreviewModal({
    show,
    onClose,
    course,
    masterPlaylistSrc,
    apiBaseUrl,
}: FullCoursePreviewModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedSection, setSelectedSection] = useState(0);
    const [selectedClass, setSelectedClass] = useState(0);
    const [currentVideoSrc, setCurrentVideoSrc] = useState(masterPlaylistSrc);

    const sections = useMemo(() => course.content ?? [], [course.content]);
    const currentSection = sections[selectedSection];
    const currentClass = currentSection?.classes?.[selectedClass];
    const currentSectionSlug = useMemo(() => slugFromTitle(currentSection?.sectionTitle), [currentSection]);
    const currentClassSlug = useMemo(() => slugFromTitle(currentClass?.title), [currentClass]);

    const buildPlaylistUrl = useCallback(
        (sectionIndex: number, classIndex: number) => {
            const section = sections[sectionIndex];
            const cls = section?.classes?.[classIndex];
            if (!section || !cls) {
                return masterPlaylistSrc;
            }
            const sectionSlug = slugFromTitle(section.sectionTitle);
            const classSlug = slugFromTitle(cls.title);
            if (!sectionSlug || !classSlug) {
                return masterPlaylistSrc;
            }
            return `${apiBaseUrl}/courses/${course.id}/full/${sectionSlug}/${classSlug}/playlist`;
        },
        [apiBaseUrl, course.id, masterPlaylistSrc, sections],
    );

    useEffect(() => {
        if (!show) return;
        const initialUrl = sections.length ? buildPlaylistUrl(0, 0) : masterPlaylistSrc;
        setSelectedSection(0);
        setSelectedClass(0);
        setCurrentVideoSrc(initialUrl);
    }, [show, buildPlaylistUrl, masterPlaylistSrc, sections.length]);

    useEffect(() => {
        if (!show) return;
        let hls: Hls | null = null;
        const videoElement = videoRef.current;
        document.body.style.overflow = "hidden";

        if (videoElement && currentVideoSrc) {
            if (Hls.isSupported()) {
                hls = new Hls({
                    xhrSetup: (xhr) => {
                        xhr.withCredentials = true;
                    },
                });
                hls.loadSource(currentVideoSrc);
                hls.attachMedia(videoElement);
            } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
                videoElement.crossOrigin = "use-credentials";
                videoElement.src = currentVideoSrc;
            }
            videoElement.currentTime = 0;
            videoElement.play().catch(() => undefined);
        }

        return () => {
            document.body.style.overflow = "";
            if (hls) {
                try {
                    hls.destroy();
                } catch {
                    // ignore
                }
            }
        };
    }, [show, currentVideoSrc]);

    useEffect(() => {
        if (!show) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        containerRef.current?.focus();
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [show, onClose]);

    useEffect(() => {
        if (!sections.length) return;
        const maxSection = sections.length - 1;
        if (selectedSection > maxSection) {
            setSelectedSection(maxSection);
            setSelectedClass(0);
        } else if (selectedClass >= (sections[selectedSection]?.classes.length ?? 0)) {
            setSelectedClass(0);
        }
    }, [sections, selectedSection, selectedClass]);

    if (!show) return null;

    const handleSelect = (sectionIndex: number, classIndex: number) => {
        setSelectedSection(sectionIndex);
        setSelectedClass(classIndex);
        setCurrentVideoSrc(buildPlaylistUrl(sectionIndex, classIndex));
    };

    const currentSubtitles = currentClass?.subtitles ?? [];

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Vista completa del curso" onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(event) => event.stopPropagation()}
                tabIndex={-1}
                ref={containerRef}
            >
                <header className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>Curso completo</p>
                        <h2>{course.title}</h2>
                        <p className={styles.subtitle}>
                            Explora todas las secciones y elige exactamente qué contenido deseas revisar.
                        </p>
                    </div>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar vista del curso completo">
                        ×
                    </button>
                </header>

                <div className={styles.body}>
                    <section className={styles.videoPanel}>
                        <div className={styles.videoWrapper}>
                            <video
                                key={`${selectedSection}-${selectedClass}`}
                                ref={videoRef}
                                controls
                                crossOrigin="use-credentials"
                                className={styles.videoPlayer}
                            >
                                {currentSectionSlug &&
                                    currentClassSlug &&
                                    currentSubtitles.map((subtitle, idx) => (
                                        <track
                                            key={`${subtitle.file}-${idx}`}
                                            kind="subtitles"
                                            src={`${apiBaseUrl}/courses/${course.id}/full/${currentSectionSlug}/${currentClassSlug}/subtitles/${subtitle.file}`}
                                            srcLang={subtitle.lang}
                                            label={subtitle.label}
                                            default={subtitle.lang === "es"}
                                        />
                                    ))}
                            </video>
                        </div>
                        <div className={styles.videoMeta}>
                            <p className={styles.nowPlaying}>Reproduciendo</p>
                            <strong>
                                {currentSection ? currentSection.sectionTitle : "Sin secciones"}{" "}
                                {currentClass ? `· ${currentClass.title}` : ""}
                            </strong>
                            {currentClass && (
                                <span className={styles.duration}>
                                    {currentClass.duration.hours > 0 ? `${currentClass.duration.hours} h ` : ""}
                                    {currentClass.duration.minutes} min
                                </span>
                            )}
                        </div>
                    </section>

                    <section className={styles.sectionsPanel} aria-label="Secciones del curso">
                        <div className={styles.sectionsHeader}>
                            <h3>Secciones</h3>
                            <p>
                                {sections.length} secciones ·{" "}
                                {sections.reduce((sum, s) => sum + s.classes.length, 0)} clases
                            </p>
                        </div>
                        <div className={styles.sectionsList}>
                            {sections.map((section, sectionIdx) => (
                                <div key={section.sectionTitle} className={styles.sectionGroup}>
                                    <button
                                        className={`${styles.sectionTitle} ${selectedSection === sectionIdx ? styles.sectionActive : ""}`}
                                        onClick={() => handleSelect(sectionIdx, 0)}
                                    >
                                        <span>Sección {sectionIdx + 1}</span>
                                        <strong>{section.sectionTitle}</strong>
                                    </button>
                                    <ul>
                                        {section.classes.map((cls, classIdx) => {
                                            const isActive =
                                                selectedSection === sectionIdx && selectedClass === classIdx;
                                            return (
                                                <li key={`${cls.title}-${classIdx}`}>
                                                    <button
                                                        className={`${styles.classButton} ${isActive ? styles.classActive : ""}`}
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
                    </section>
                </div>
            </div>
        </div>
    );
}
