"use client";

import { RefObject, useState } from "react";
import mobileStyles from "../css/MobilePurchasedCourseContent.module.css";
import { Course, ContentSection, Classes, SubtitleTrack } from "@/app/interfaces/courses";

interface MobilePurchasedCourseContentProps {
    course: Course;
    sections: ContentSection[];
    selectedSection: number;
    selectedClass: number;
    currentSection?: ContentSection;
    currentClass?: Classes;
    videoRef: RefObject<HTMLVideoElement>;
    currentSectionSlug?: string;
    currentClassSlug?: string;
    currentSubtitles: SubtitleTrack[];
    baseUrl: string;
    onSelect: (sectionIndex: number, classIndex: number) => void;
    progress: number;
    totalSections: number;
    totalClasses: number;
    durationHours: number;
    durationMinutes: number;
}

const formatDuration = (hours: number, minutes: number) => {
    if (hours > 0) {
        return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
    }
    return `${minutes.toString().padStart(2, "0")} min`;
};

export default function MobilePurchasedCourseContent({
    course,
    sections,
    selectedSection,
    selectedClass,
    currentSection,
    currentClass,
    videoRef,
    currentSectionSlug,
    currentClassSlug,
    currentSubtitles,
    baseUrl,
    onSelect,
    progress,
    totalSections,
    totalClasses,
    durationHours,
    durationMinutes,
}: MobilePurchasedCourseContentProps) {
    const [tab, setTab] = useState<"clases" | "mas">("clases");

    return (
        <section className={mobileStyles.mobileCourseLayout}>
            <div className={mobileStyles.mobilePlayerShell}>
                <video
                    ref={videoRef}
                    controls
                    crossOrigin="use-credentials"
                    className={mobileStyles.mobilePlayerVideo}
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

            <div className={mobileStyles.mobileCourseInfo}>
                <p className={mobileStyles.mobileEyebrow}>Curso completo</p>
                <h2>{course.title}</h2>
                <span className={mobileStyles.mobileInstructor}>Equipo Combat Strike</span>
                <div className={mobileStyles.mobileTabs}>
                    <button
                        type="button"
                        className={tab === "clases" ? mobileStyles.mobileTabActive : ""}
                        onClick={() => setTab("clases")}
                    >
                        Clases
                    </button>
                    <button
                        type="button"
                        className={tab === "mas" ? mobileStyles.mobileTabActive : ""}
                        onClick={() => setTab("mas")}
                    >
                        Más
                    </button>
                </div>
            </div>

            {tab === "clases" && (
                <div className={mobileStyles.mobileSectionList}>
                    {sections.map((section, sectionIdx) => (
                        <div key={section.sectionTitle} className={mobileStyles.mobileSectionCard}>
                            <header className={mobileStyles.mobileSectionHeader}>
                                <div>
                                    <span className={mobileStyles.mobileSectionLabel}>Sección {sectionIdx + 1}</span>
                                    <h3>{section.sectionTitle}</h3>
                                </div>
                                <span className={mobileStyles.mobileSectionMeta}>{section.classes.length} clases</span>
                            </header>
                            <ul>
                                {section.classes.map((cls, classIdx) => {
                                    const isActive =
                                        selectedSection === sectionIdx && selectedClass === classIdx;
                                    return (
                                        <li key={`${section.sectionTitle}-${classIdx}`}>
                                            <button
                                                type="button"
                                                onClick={() => onSelect(sectionIdx, classIdx)}
                                                className={`${mobileStyles.mobileClassButton} ${
                                                    isActive ? mobileStyles.mobileClassButtonActive : ""
                                                }`}
                                            >
                                                <span className={mobileStyles.mobileClassIndex}>{classIdx + 1}</span>
                                                <div>
                                                    <p>{cls.title}</p>
                                                    <small>Video · {formatDuration(cls.duration.hours, cls.duration.minutes)}</small>
                                                </div>
                                                <span className={mobileStyles.mobileClassIcon} aria-hidden="true">
                                                    ↓
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {tab === "mas" && (
                <div className={mobileStyles.mobileMoreContent}>
                    <article className={mobileStyles.mobileMoreCard}>
                        <header>
                            <span>Progreso actual</span>
                            <strong>{progress}%</strong>
                        </header>
                        <div className={mobileStyles.mobileMoreProgress}>
                            <span style={{ width: `${progress}%` }} />
                        </div>
                        <p>
                            {totalSections} secciones · {totalClasses} clases · {durationHours} h {durationMinutes} min
                        </p>
                    </article>

                    <article className={mobileStyles.mobileMoreCard}>
                        <header>
                            <span>Requisitos</span>
                        </header>
                        <ul>
                            {course.requirements?.map((req) => (
                                <li key={req}>{req}</li>
                            ))}
                        </ul>
                    </article>

                    <article className={mobileStyles.mobileMoreCard}>
                        <header>
                            <span>Incluye</span>
                        </header>
                        <ul>
                            {course.includes?.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </article>
                </div>
            )}
        </section>
    );
}
