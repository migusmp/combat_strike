"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../../css/MobilePurchasedCourseContent.module.css";
import { Classes, ContentSection } from "@/app/interfaces/courses";
import { loadTime, saveTime, timeKey } from "../../utils/videoProgress";
import { slugFromTitle } from "../../utils/slugFromTitle";

type Props = {
  courseId: number;
  baseUrl: string;
  sections: ContentSection[];
  selectedSection: number;
  selectedClass: number;
  onSelect: (s: number, c: number) => void;
  formatDuration: (h: number, m: number) => string;
  currentTime: number;
  currentDuration: number;
};

type ServerProgress = {
  sectionSlug: string;
  classSlug: string;
  positionSeconds: number;
  durationSeconds: number;
  completedAt?: string | null;
};

type SluggedSection = {
  sectionTitle: string;
  slug: string;
  classes: Array<Classes & { slug: string; durationSeconds: number }>;
};

const clampProgress = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const durationInSeconds = (cls: Classes) =>
  Math.max(0, (cls.duration?.hours ?? 0) * 3600 + (cls.duration?.minutes ?? 0) * 60);

export default function SectionList({
  courseId,
  baseUrl,
  sections,
  selectedSection,
  selectedClass,
  onSelect,
  formatDuration,
  currentTime,
  currentDuration,
}: Props) {
  const sluggedSections: SluggedSection[] = useMemo(
    () =>
      sections.map((section) => ({
        sectionTitle: section.sectionTitle,
        slug: slugFromTitle(section.sectionTitle),
        classes: section.classes.map((cls) => ({
          ...cls,
          slug: slugFromTitle(cls.title),
          durationSeconds: durationInSeconds(cls),
        })),
      })),
    [sections]
  );

  const emptyMap = useCallback(
    () => sluggedSections.map((section) => section.classes.map(() => 0)),
    [sluggedSections],
  );

  const buildStoredProgress = useCallback(
    () =>
      sluggedSections.map((section) =>
        section.classes.map((cls) => {
          const storedSeconds = loadTime(timeKey(courseId, section.slug, cls.slug));
          if (!cls.durationSeconds) return 0;
          return clampProgress((storedSeconds / cls.durationSeconds) * 100);
        })
      ),
    [courseId, sluggedSections]
  );

  const [progressMap, setProgressMap] = useState<number[][]>(() => buildStoredProgress());
  const [serverProgressMap, setServerProgressMap] = useState<number[][]>(() => emptyMap());
  const [resetting, setResetting] = useState<Record<string, boolean>>({});

  // Reset mapas cuando cambian secciones
  useEffect(() => {
    setProgressMap(buildStoredProgress());
    setServerProgressMap(emptyMap());
  }, [buildStoredProgress, emptyMap]);

  // Trae progreso desde el servidor
  useEffect(() => {
    let cancelled = false;
    const fetchProgress = async () => {
      try {
        const res = await fetch(`${baseUrl}/courses/${courseId}/progress`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data: ServerProgress[] = await res.json();
        if (cancelled) return;

        const incoming = emptyMap();
        data.forEach((row) => {
          const sectionIdx = sluggedSections.findIndex((s) => s.slug === row.sectionSlug);
          if (sectionIdx === -1) return;
          const classIdx = sluggedSections[sectionIdx].classes.findIndex((c) => c.slug === row.classSlug);
          if (classIdx === -1) return;
          const pct = row.completedAt
            ? 100
            : clampProgress((row.positionSeconds / Math.max(1, row.durationSeconds)) * 100);
          incoming[sectionIdx][classIdx] = pct;

          // Sincroniza almacen local con server para evitar saltos por sessionStorage
          const key = timeKey(courseId, row.sectionSlug, row.classSlug);
          const clampedSeconds = Math.max(
            0,
            Math.min(
              Math.floor(row.positionSeconds),
              Math.max(1, Math.floor(row.durationSeconds ?? row.positionSeconds)),
            ),
          );
          saveTime(key, clampedSeconds);
        });
        setServerProgressMap(incoming);
        setProgressMap(incoming);
      } catch {
        /* noop */
      }
    };
    fetchProgress();
    return () => {
      cancelled = true;
    };
  }, [baseUrl, courseId, emptyMap, sluggedSections]);

  useEffect(() => {
    const section = sluggedSections[selectedSection];
    const cls = section?.classes?.[selectedClass];
    if (!section || !cls) return;

    const totalSeconds =
      (Number.isFinite(currentDuration) && currentDuration > 0 ? currentDuration : cls.durationSeconds) || 0;
    if (!totalSeconds) return;

    const pct = clampProgress((currentTime / totalSeconds) * 100);
    setProgressMap((prev) => {
      const currentValue = prev[selectedSection]?.[selectedClass];
      if (currentValue === pct) return prev;

      const next = sluggedSections.map((sec, secIdx) => {
        const prevRow = prev[secIdx] ?? [];
        return sec.classes.map((_, classIdx) => {
          if (secIdx === selectedSection && classIdx === selectedClass) {
            return pct;
          }
          const serverPct = serverProgressMap[secIdx]?.[classIdx] ?? 0;
          return Math.max(prevRow[classIdx] ?? 0, serverPct);
        });
      });

      return next;
    });
  }, [currentDuration, currentTime, selectedClass, selectedSection, sluggedSections, serverProgressMap]);

  const handleReset = async (sectionIdx: number, classIdx: number) => {
    const section = sluggedSections[sectionIdx];
    const cls = section?.classes?.[classIdx];
    if (!section || !cls) return;
    const key = `${sectionIdx}-${classIdx}`;
    setResetting((prev) => ({ ...prev, [key]: true }));
    const durationSeconds = Math.max(1, cls.durationSeconds || 1);
    try {
      await fetch(`${baseUrl}/courses/${courseId}/progress`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionSlug: section.slug,
          classSlug: cls.slug,
          positionSeconds: 0,
          durationSeconds,
        }),
      });
      setServerProgressMap((prev) =>
        prev.map((sec, sIdx) =>
          sec.map((pct, cIdx) => (sIdx === sectionIdx && cIdx === classIdx ? 0 : pct)),
        ),
      );
      setProgressMap((prev) =>
        prev.map((sec, sIdx) =>
          sec.map((pct, cIdx) => (sIdx === sectionIdx && cIdx === classIdx ? 0 : pct)),
        ),
      );
      saveTime(timeKey(courseId, section.slug, cls.slug), 0);
    } catch {
      /* ignore errors */
    } finally {
      setResetting((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (!sections?.length) {
    return (
      <div className={styles.mobileSectionList}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${styles.mobileSectionCard} ${styles.mobileSkeletonCard}`}>
            <div className={styles.mobileSkeletonLineWide} />
            <div className={styles.mobileSkeletonLine} />
            <div className={styles.mobileSkeletonPills}>
              <span />
              <span />
              <span />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.mobileSectionList}>
      {sections.map((section, sectionIdx) => (
        <div key={section.sectionTitle} className={styles.mobileSectionCard}>
          <header className={styles.mobileSectionHeader}>
            <div>
              <span className={styles.mobileSectionLabel}>Sección {sectionIdx + 1}</span>
              <h3>{section.sectionTitle}</h3>
            </div>
            <span className={styles.mobileSectionMeta}>{section.classes.length} clases</span>
          </header>

          <ul>
            {section.classes.map((cls, classIdx) => {
              const isActive = selectedSection === sectionIdx && selectedClass === classIdx;
              const progressPct = progressMap[sectionIdx]?.[classIdx] ?? 0;
              const isComplete = progressPct >= 98;
              return (
                <li key={`${section.sectionTitle}-${classIdx}`}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(sectionIdx, classIdx)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(sectionIdx, classIdx); } }}
                    className={`${styles.mobileClassButton} ${isActive ? styles.mobileClassButtonActive : ""}`}
                  >
                    <span
                      className={`${styles.mobileClassIndex} ${isComplete ? styles.mobileClassIndexDone : ""}`}
                    >
                      {isComplete ? "✓" : classIdx + 1}
                    </span>
                    <div className={styles.mobileClassCopy}>
                      <p>{cls.title}</p>
                      <small>Video · {formatDuration(cls.duration.hours, cls.duration.minutes)}</small>
                      <div className={styles.mobileClassProgressRow}>
                        <div className={styles.mobileClassProgressTrack} aria-hidden="true">
                          <span style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className={styles.mobileClassProgressLabel}>
                          {isComplete ? "Completado" : `${progressPct}%`}
                        </span>
                      </div>
                      {isComplete && (
                        <div className={styles.mobileClassCompleteRow}>
                          <span className={styles.mobileClassCompleteTag}>Completado</span>
                          <button
                            type="button"
                            className={styles.mobileClassReset}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleReset(sectionIdx, classIdx);
                              onSelect(sectionIdx, classIdx);
                            }}
                            disabled={!!resetting[`${sectionIdx}-${classIdx}`]}
                          >
                            {resetting[`${sectionIdx}-${classIdx}`] ? "Reiniciando..." : "Volver a ver"}
                          </button>
                        </div>
                      )}
                    </div>
                    <span className={styles.mobileClassIcon} aria-hidden="true">↓</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
