"use client";
import VideoPlayerShell from "./mobile-player/VideoPlayerShell";
import SettingsModal from "./mobile-player/SettingsModal";
import SectionList from "./mobile-player/SectionList";
import MorePanel from "./mobile-player/MorePanel";
import styles from "../css/MobilePurchasedCourseContent.module.css";
import { RefObject, useEffect, useMemo, useState } from "react";
import { Course, SubtitleTrack, ContentSection, Classes } from "@/app/interfaces/courses";
import { useVideoController } from "./mobile-player/useVideController";

interface Props {
  course: Course;
  sections: ContentSection[];
  selectedSection: number;
  selectedClass: number;
  currentSection: ContentSection | null;
  currentClass: Classes | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentSectionSlug: string | undefined;
  currentClassSlug: string | undefined;
  currentSubtitles: SubtitleTrack[];
  selectedSubtitle: "off" | string;
  setSelectedSubtitle: (lang: "off" | string) => void;
  baseUrl: string;
  onSelect: (sectionIdx: number, classIdx: number) => void;
  progress: number;
  totalSections: number;
  totalClasses: number;
  durationHours: number;
  durationMinutes: number;
}


const formatDuration = (hours: number, minutes: number) =>
  hours > 0 ? `${hours} h ${minutes.toString().padStart(2,"0")} min` : `${minutes.toString().padStart(2,"0")} min`;

export default function MobilePurchasedCourseContent({
  course, sections, selectedSection, selectedClass,
  videoRef, currentSectionSlug, currentClassSlug,
  currentSubtitles, selectedSubtitle, setSelectedSubtitle, baseUrl, onSelect,
  progress, totalSections, totalClasses, durationHours, durationMinutes,
}: Props) {
  const vc = useVideoController({
    videoRef,
    sections,
    selectedSection,
    selectedClass,
    onSelect,
    currentSubtitles,
  });

  const [tab, setTab] = useState<"clases" | "mas">("clases");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Mantén el controller sincronizado con la preferencia global del hook
  useEffect(() => {
    vc.setSelectedSubtitle(selectedSubtitle);
  }, [selectedSubtitle]);

  const srcKey = useMemo(() => {
  return currentSectionSlug && currentClassSlug
    ? `${course.id}/${currentSectionSlug}/${currentClassSlug}`
    : `master:${course.id}`;
}, [course.id, currentSectionSlug, currentClassSlug]);

  return (
    <section className={styles.mobileCourseLayout}>
      <header className={styles.mobileStickyHeader}>
        <VideoPlayerShell
          srcKey={srcKey}
          videoRef={videoRef}
          shellRef={vc.shellRef}
          overlayActive={vc.overlayActive}
          progressOnly={vc.progressOnly}
          selectedSubtitle={selectedSubtitle}
          currentSubtitles={currentSubtitles}
          baseUrl={baseUrl}
          courseId={course.id}
          onTap={vc.onVideoPointerDown}
          onToggleSettings={() => setSettingsOpen(true)}
          onQuickToggleCC={() => {
            const next = selectedSubtitle === "off" ? (currentSubtitles[0]?.lang ?? "off") : "off";
            vc.setSelectedSubtitle(next);
            setSelectedSubtitle(next);
          }}
          endCard={vc.endCard}
          onCancelAutoNext={vc.cancelAutoNext}
          onPlayNextNow={vc.playNextNow}
          overlayProps={{
            overlayActive: vc.overlayActive,
            isPlaying: vc.isPlaying,
            hasPrev: vc.hasPrev,
            hasNext: vc.hasNext,
            currentTime: vc.currentTime,
            duration: vc.duration,
            progressRef: vc.progressRef,
            onTap: vc.onVideoPointerDown,
            onSeek: vc.onSeek,
            onProgressPointerDown: vc.onProgressPointerDown,
            togglePlay: vc.togglePlay,
            goPrev: vc.goPrev,
            goNext: vc.goNext,
            isFullscreen: vc.isFullscreen,
            isEnded: vc.isEnded,
            toggleFullscreen: vc.toggleFullscreen,
            formatTimeLabel: vc.formatTimeLabel,
            sectionSlug: currentSectionSlug,
            classSlug: currentClassSlug,
            progressOnly: vc.progressOnly || !!vc.endCard?.active,
          }}
          seekHint={vc.seekHint}
        />

        {/* Cabecera + tabs */}
        <div className={styles.mobileCourseInfo}>
          <p className={styles.mobileEyebrow}>Curso completo</p>
          <h2>{course.title}</h2>
          <span className={styles.mobileInstructor}>Equipo Combat Strike</span>
          <div className={styles.mobileTabs}>
            <button type="button" className={tab === "clases" ? styles.mobileTabActive : ""} onClick={() => setTab("clases")}>Clases</button>
            <button type="button" className={tab === "mas" ? styles.mobileTabActive : ""} onClick={() => setTab("mas")}>Más</button>
          </div>
        </div>
      </header>

      <div className={styles.mobileScrollableContent}>
        {tab === "clases" ? (
          <SectionList
            sections={sections}
            selectedSection={selectedSection}
            selectedClass={selectedClass}
            onSelect={onSelect}
            formatDuration={formatDuration}
          />
        ) : (
          <MorePanel
            progress={progress}
            totalSections={totalSections}
            totalClasses={totalClasses}
            durationHours={durationHours}
            durationMinutes={durationMinutes}
            requirements={course.requirements}
            includes={course.includes}
          />
        )}
      </div>

      {settingsOpen && (
        <SettingsModal
          selected={selectedSubtitle}
          tracks={currentSubtitles}
          onSelect={(lang) => { vc.setSelectedSubtitle(lang); setSelectedSubtitle(lang); setSettingsOpen(false); }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </section>
  );
}
