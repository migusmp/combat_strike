"use client";

import { useMemo } from "react";
import styles from "./MobilePurchasedCourseLayout.module.css";
import { Course } from "@/app/interfaces/courses";
import { PurchasedCourse } from "@/app/interfaces/purchases";
import { useFullCoursePreview } from "../../hooks/useFullCoursePreview";
import MobilePurchasedCourseContent from "../MobilePurchasedCourseContent";

interface Props {
  course: Course;
  purchase?: PurchasedCourse;
}

export default function MobilePurchasedCourseLayout({ course, purchase }: Props) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const fullCourseSrc = `${baseUrl}/courses/${course.id}/full/playlist`;

  const progress = useMemo(() => {
    const raw = (purchase?.course as unknown as { progress?: number } | undefined)?.progress;
    if (typeof raw !== "number") return 0;
    return Math.min(100, Math.max(0, Math.round(raw)));
  }, [purchase?.course]);

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

  const totalSections = course.content.length;
  const totalClasses = course.content.reduce((sum, section) => sum + section.classes.length, 0);
  const totalMinutes = course.content.reduce((m, s) => {
    s.classes.forEach((cls) => (m += cls.duration.hours * 60 + cls.duration.minutes));
    return m;
  }, 0);
  const durationHours = Math.floor(totalMinutes / 60);
  const durationMinutes = totalMinutes % 60;

  return (
    <div className={styles.mobileWrapper}>
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
    </div>
  );
}
