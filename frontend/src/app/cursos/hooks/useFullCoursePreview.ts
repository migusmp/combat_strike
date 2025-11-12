"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Course } from "@/app/interfaces/courses";
import { loadTime, saveTime, timeKey } from "../utils/videoProgress";
import { logHls } from "../utils/telemetry";

// ✅ Helpers (asegúrate de tener estos archivos)

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

  // 🔑 Clave de reanudación por curso/section/class
  const progressKey = useMemo(
    () => timeKey(course.id, currentSectionSlug, currentClassSlug),
    [course.id, currentSectionSlug, currentClassSlug]
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

    // Función común para restaurar tiempo y reproducir
    const restoreAndPlay = () => {
      const t = loadTime(progressKey);
      if (Number.isFinite(t) && t > 0) {
        try { videoEl.currentTime = Math.max(0, t - 1); } catch {}
      }
      videoEl.play().catch(() => { /* autoplay bloqueado */ });
    };

    // Safari (HLS nativo)
    if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
      videoEl.crossOrigin = "use-credentials";
      videoEl.src = currentVideoSrc;
      videoEl.load();

      const onLoaded = () => restoreAndPlay();
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

    // attach → loadSource
    hls.attachMedia(videoEl);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.startLoad(0);
      hls.loadSource(currentVideoSrc);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, restoreAndPlay);

    hls.on(Hls.Events.LEVEL_LOADED, () => {
      // si ya hay datos, intenta reproducir
      if (videoEl.readyState >= 2 && videoEl.paused) {
        videoEl.play().catch(() => {});
      }
    });

    hls.on(Hls.Events.ERROR, (_e, data) => {
      logHls({ level: data.fatal ? "error" : "warn", detail: data.details, data });

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
  }, [active, currentVideoSrc, progressKey]);

  // Guardado periódico del progreso (cada ~1s)
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    let last = 0;
    const onTime = () => {
      const now = performance.now();
      if (now - last > 1000) {
        saveTime(progressKey, el.currentTime);
        last = now;
      }
    };

    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [progressKey]);

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

  // Cambio manual de clase/sección
  const handleSelect = useCallback((sectionIndex: number, classIndex: number) => {
    const el = videoRef.current;
    if (el) saveTime(progressKey, el.currentTime); // guarda antes de saltar

    setSelectedSection(sectionIndex);
    setSelectedClass(classIndex);
    setCurrentVideoSrc(buildPlaylistUrl(sectionIndex, classIndex));
  }, [buildPlaylistUrl, progressKey]);

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
    currentVideoSrc,   // para usar como `key` si quieres
    handleSelect,
  };
}