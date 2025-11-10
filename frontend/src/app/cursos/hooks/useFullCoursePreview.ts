"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Course } from "@/app/interfaces/courses";

interface UseFullCoursePreviewOptions {
    course: Course;
    masterPlaylistSrc: string;
    apiBaseUrl: string;
    active: boolean;
}

const slugFromTitle = (value?: string) =>
    (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

export function useFullCoursePreview({ course, masterPlaylistSrc, apiBaseUrl, active }: UseFullCoursePreviewOptions) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [selectedSection, setSelectedSection] = useState(0);
    const [selectedClass, setSelectedClass] = useState(0);
    const [currentVideoSrc, setCurrentVideoSrc] = useState(masterPlaylistSrc);

    const sections = useMemo(() => course.content ?? [], [course.content]);
    const currentSection = sections[selectedSection];
    const currentClass = currentSection?.classes?.[selectedClass];

    const currentSectionSlug = useMemo(() => slugFromTitle(currentSection?.sectionTitle), [currentSection?.sectionTitle]);
    const currentClassSlug = useMemo(() => slugFromTitle(currentClass?.title), [currentClass?.title]);

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
        if (!active) return;
        const initialUrl = sections.length ? buildPlaylistUrl(0, 0) : masterPlaylistSrc;
        setSelectedSection(0);
        setSelectedClass(0);
        setCurrentVideoSrc(initialUrl);
    }, [active, buildPlaylistUrl, masterPlaylistSrc, sections.length]);

    useEffect(() => {
        if (!active) return;
        let hls: Hls | null = null;
        const videoElement = videoRef.current;

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
            if (hls) {
                try {
                    hls.destroy();
                } catch {
                    // ignore
                }
            }
        };
    }, [active, currentVideoSrc]);

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

    const handleSelect = useCallback(
        (sectionIndex: number, classIndex: number) => {
            setSelectedSection(sectionIndex);
            setSelectedClass(classIndex);
            setCurrentVideoSrc(buildPlaylistUrl(sectionIndex, classIndex));
        },
        [buildPlaylistUrl],
    );

    const currentSubtitles = currentClass?.subtitles ?? [];

    return {
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
    };
}
