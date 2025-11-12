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

export function useFullCoursePreview({
  course,
  masterPlaylistSrc,
  apiBaseUrl,
  active,
}: UseFullCoursePreviewOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [selectedSection, setSelectedSection] = useState(0);
  const [selectedClass, setSelectedClass] = useState(0);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(masterPlaylistSrc);

  const sections = useMemo(() => course.content ?? [], [course.content]);
  const currentSection = sections[selectedSection];
  const currentClass = currentSection?.classes?.[selectedClass];

  const currentSectionSlug = useMemo(
    () => slugFromTitle(currentSection?.sectionTitle),
    [currentSection?.sectionTitle]
  );
  const currentClassSlug = useMemo(
    () => slugFromTitle(currentClass?.title),
    [currentClass?.title]
  );

  const buildPlaylistUrl = useCallback(
    (sectionIndex: number, classIndex: number) => {
      const section = sections[sectionIndex];
      const cls = section?.classes?.[classIndex];
      if (!section || !cls) return masterPlaylistSrc;
      const sectionSlug = slugFromTitle(section.sectionTitle);
      const classSlug = slugFromTitle(cls.title);
      return `${apiBaseUrl}/courses/${course.id}/full/${sectionSlug}/${classSlug}/playlist`;
    },
    [apiBaseUrl, course.id, masterPlaylistSrc, sections]
  );

  // Inicialización de selección + URL
  useEffect(() => {
    if (!active) return;
    const initialUrl = sections.length ? buildPlaylistUrl(0, 0) : masterPlaylistSrc;
    setSelectedSection(0);
    setSelectedClass(0);
    setCurrentVideoSrc(initialUrl);
  }, [active, buildPlaylistUrl, masterPlaylistSrc, sections.length]);

  // Montaje HLS estable (primer render + cambios de src + cambios de layout)
  useEffect(() => {
    if (!active) return;

    const videoEl = videoRef.current;
    if (!videoEl || !currentVideoSrc) return;

    // Limpieza previa
    if (hlsRef.current) {
      try { hlsRef.current.stopLoad(); } catch {}
      try { hlsRef.current.destroy(); } catch {}
      hlsRef.current = null;
    }

    // Autoplay friendly
    videoEl.muted = true;
    (videoEl as any).playsInline = true;

    // Safari (HLS nativo)
    if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
      videoEl.crossOrigin = "use-credentials";
      videoEl.src = currentVideoSrc;
      videoEl.load();

      const onLoaded = () => {
        videoEl.play().catch(() => {/* autoplay bloqueado */});
      };
      videoEl.addEventListener("loadedmetadata", onLoaded, { once: true });

      return () => {
        videoEl.removeEventListener("loadedmetadata", onLoaded);
        videoEl.removeAttribute("src");
        videoEl.load();
      };
    }

    // Hls.js
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      xhrSetup: (xhr) => { xhr.withCredentials = true; },
    });

    // ⚠️ Importante: attach → loadSource (en este orden)
    hls.attachMedia(videoEl);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.startLoad(0);
      hls.loadSource(currentVideoSrc);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoEl.play().catch(() => {/* autoplay bloqueado */});
    });

    // Si por timing ya tenemos nivel cargado, reproduce
    hls.on(Hls.Events.LEVEL_LOADED, () => {
      if (videoEl.readyState < 2) return; // HAVE_CURRENT_DATA
      if (videoEl.paused) {
        videoEl.play().catch(() => {/* autoplay bloqueado */});
      }
    });

    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            try { hls.destroy(); } catch {}
            break;
        }
      }
    });

    hlsRef.current = hls;

    return () => {
      try { hls.stopLoad(); } catch {}
      try { hls.destroy(); } catch {}
      hlsRef.current = null;
      videoEl.removeAttribute("src");
      videoEl.load();
    };
  }, [active, currentVideoSrc]);

  // Corrección de índices si cambia el contenido
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

  const handleSelect = useCallback((sectionIndex: number, classIndex: number) => {
    setSelectedSection(sectionIndex);
    setSelectedClass(classIndex);
    setCurrentVideoSrc(buildPlaylistUrl(sectionIndex, classIndex));
  }, [buildPlaylistUrl]);

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
    currentVideoSrc,   // 👈 DEVUELTO para usar como `key`
    handleSelect,
  };
}