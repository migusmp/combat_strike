"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "./DesktopPurchasedCourseLayout.module.css";
import { useFullCoursePreview } from "../../hooks/useFullCoursePreview";
import { Course } from "@/app/interfaces/courses";
import { PurchasedCourse } from "@/app/interfaces/purchases";

interface Props {
  course: Course;
  purchase?: PurchasedCourse;
}

const HIDE_HEADER_CLASS = "cs-hide-global-header";

export default function DesktopPurchasedCourseLayout({ course }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<"content" | "downloads">("content");

  const baseUrl = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, ""),
    []
  );
  const fullCourseSrc = `${baseUrl}/courses/${course.id}/full/playlist`;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    body.classList.add(HIDE_HEADER_CLASS);
    html.classList.add(HIDE_HEADER_CLASS);
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      body.classList.remove(HIDE_HEADER_CLASS);
      html.classList.remove(HIDE_HEADER_CLASS);
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
    };
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
    selectedSubtitle,
    setSelectedSubtitle,
    handleSelect,
  } = useFullCoursePreview({
    course,
    masterPlaylistSrc: fullCourseSrc,
    apiBaseUrl: baseUrl,
    active: true,
  });

  const flatIndex = useMemo(() => {
    if (!sections.length) return null;
    let acc = 0;
    for (let s = 0; s < sections.length; s += 1) {
      const len = sections[s]?.classes?.length ?? 0;
      if (s < selectedSection) {
        acc += len;
        continue;
      }
      acc += Math.min(len, selectedClass + 1);
      break;
    }
    return acc > 0 ? acc : 1;
  }, [sections, selectedSection, selectedClass]);

  const canToggleCC = currentSubtitles.length > 0;
  const subtitleToggleLabel =
    selectedSubtitle === "off" ? "Mostrar subtítulos" : "Ocultar subtítulos";

  const handleSubtitleToggle = () => {
    if (!canToggleCC) return;
    const next =
      selectedSubtitle === "off" ? currentSubtitles[0]?.lang ?? "off" : "off";
    setSelectedSubtitle(next);
  };

  const onSelectClass = (sectionIdx: number, classIdx: number) => {
    handleSelect(sectionIdx, classIdx);
  };

  const classNumber = flatIndex ? `${flatIndex}.` : "";
  const playingTitle = currentClass?.title ?? course.title;

  const videoFrameClass = `${styles.videoFrame} ${
    sidebarOpen ? styles.videoFrameSidebar : styles.videoFrameFull
  }`;
  const videoViewportClass = `${styles.videoViewport} ${
    sidebarOpen ? styles.videoViewportSidebar : styles.videoViewportFull
  }`;

  const stageClass = `${styles.videoStage} ${
    sidebarOpen ? styles.videoStageSidebar : ""
  }`;

  return (
    <section className={styles.screen}>
      <div className={stageClass}>
        <div className={styles.topChrome}>
          <div className={styles.leftCluster}>
            <div className={styles.brandMark} aria-label="Combat Strike">
              <Image
                src="/assets/logo-blanco-sin-texto-small.webp"
                alt="Combat Strike"
                width={38}
                height={38}
                className={styles.brandLogo}
                priority
              />
            </div>
            {/* <span className={styles.betaPill}>Beta</span> */}
            <div className={styles.playingMeta}>
              <span className={styles.lessonTitle}>
                {classNumber} {playingTitle}
              </span>
              <span className={styles.playBadge} aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="11"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.4"
                  />
                  <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="currentColor" />
                </svg>
              </span>
            </div>
          </div>

          <div className={styles.rightCluster}>
            <button
              type="button"
              className={styles.iconButton}
              aria-pressed={sidebarOpen}
              aria-label="Abrir índice del curso"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="6"
                  width="16"
                  height="2.2"
                  rx="1.1"
                  fill="currentColor"
                  opacity="0.9"
                />
                <rect
                  x="4"
                  y="11"
                  width="16"
                  height="2.2"
                  rx="1.1"
                  fill="currentColor"
                  opacity="0.75"
                />
                <rect
                  x="4"
                  y="16"
                  width="10"
                  height="2.2"
                  rx="1.1"
                  fill="currentColor"
                  opacity="0.55"
                />
              </svg>
            </button>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={subtitleToggleLabel}
              onClick={handleSubtitleToggle}
              disabled={!canToggleCC}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 12C4 8.686 6.686 6 10 6H14C17.314 6 20 8.686 20 12C20 15.314 17.314 18 14 18H10C6.686 18 4 15.314 4 12Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  opacity="0.9"
                />
                <path
                  d="M10 9.75C9.17 9.75 8.5 10.42 8.5 11.25V12.75C8.5 13.58 9.17 14.25 10 14.25H11"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 9.75C13.17 9.75 12.5 10.42 12.5 11.25V12.75C12.5 13.58 13.17 14.25 14 14.25H15.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className={videoFrameClass}>
          <div className={styles.noise} aria-hidden="true" />
          <div className={videoViewportClass}>
            <video
              ref={videoRef}
              className={styles.videoElement}
              controls
              playsInline
              crossOrigin="use-credentials"
              poster={course.image}
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
        </div>

        <aside
          className={`${styles.sidebar} ${
            sidebarOpen ? styles.sidebarOpen : ""
          }`}
          aria-label="Contenido del curso"
        >
          <div className={styles.sidebarTopActions}>
            <div className={styles.topPill}>
              <button
                type="button"
                className={`${styles.pillButton} ${
                  panelTab === "content" ? styles.pillButtonActive : ""
                }`}
                aria-label="Contenido del curso"
                aria-pressed={panelTab === "content"}
                onClick={() => setPanelTab("content")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-play-btn-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2m6.79-6.907A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                </svg>
              </button>
              <button
                type="button"
                className={`${styles.pillButton} ${
                  panelTab === "downloads" ? styles.pillButtonActive : ""
                }`}
                aria-label="Descargas"
                aria-pressed={panelTab === "downloads"}
                onClick={() => setPanelTab("downloads")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v12" />
                  <path d="m8 11 4 4 4-4" />
                  <path d="M5 21h14" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              className={styles.closeActionButton}
              aria-label="Cerrar panel"
              onClick={() => setSidebarOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {panelTab === "content" ? (
            <>
              <div className={styles.sidebarHeader}>
                <div>
                  <p className={styles.sidebarEyebrow}>Contenido del curso</p>
                  <h3 className={styles.sidebarTitle}>{course.title}</h3>
                  {currentSection && (
                    <p className={styles.sidebarNowPlaying}>
                      Reproduciendo: {currentSection.sectionTitle}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.sidebarList}>
                {sections.map((section, sectionIdx) => (
                  <div
                    key={section.sectionTitle}
                    className={styles.sectionBlock}
                  >
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionNumber}>
                        Sección {sectionIdx + 1}
                      </span>
                      <strong className={styles.sectionName}>
                        {section.sectionTitle}
                      </strong>
                    </div>
                    <ul className={styles.classList}>
                      {section.classes.map((cls, classIdx) => {
                        const isActive =
                          sectionIdx === selectedSection &&
                          classIdx === selectedClass;
                        const priorClasses = sections
                          .slice(0, sectionIdx)
                          .reduce(
                            (sum, s) => sum + (s.classes?.length ?? 0),
                            0
                          );
                        const itemNumber = priorClasses + classIdx + 1;
                        const durationLabel =
                          cls.duration.hours > 0
                            ? `${cls.duration.hours}h ${cls.duration.minutes
                                .toString()
                                .padStart(2, "0")}m`
                            : `${cls.duration.minutes
                                .toString()
                                .padStart(2, "0")}m`;

                        return (
                          <li key={`${cls.title}-${classIdx}`}>
                            <button
                              type="button"
                              className={`${styles.classButton} ${
                                isActive ? styles.classButtonActive : ""
                              }`}
                              onClick={() =>
                                onSelectClass(sectionIdx, classIdx)
                              }
                            >
                              <span className={styles.classIndex}>
                                {itemNumber.toString().padStart(2, "0")}
                              </span>
                              <div className={styles.classInfo}>
                                <span className={styles.classTitle}>
                                  {cls.title}
                                </span>
                                <span className={styles.classMeta}>
                                  {durationLabel}
                                </span>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              <div className={styles.descriptionBar}>
                <button type="button" className={styles.descriptionToggle}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  Ver descripción general del curso
                </button>
                <div className={styles.descriptionCard}>
                  <div className={styles.descriptionThumb}>
                    <Image
                      src={course.image}
                      alt={course.title}
                      width={48}
                      height={48}
                      className={styles.descriptionImage}
                    />
                  </div>
                  <div className={styles.descriptionBody}>
                    <p className={styles.descriptionTitle}>{course.title}</p>
                    <p className={styles.descriptionText}>
                      {course.description || "Descripción general del curso"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.sidebarDownloads}>
              <h4 className={styles.downloadsTitle}>Descargas</h4>
              {course.downloadables?.length ? (
                <ul className={styles.downloadList}>
                  {course.downloadables.map((item, idx) => (
                    <li key={`${item}-${idx}`} className={styles.downloadItem}>
                      <span className={styles.downloadIndex}>{idx + 1}</span>
                      <span className={styles.downloadName}>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.downloadEmpty}>
                  No hay descargas disponibles.
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
