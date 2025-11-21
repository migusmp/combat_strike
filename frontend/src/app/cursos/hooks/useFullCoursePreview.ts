"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Course } from "@/app/interfaces/courses";
import {
  applyTextTrackSelection,
  clearManualTracks,
  loadCC,
  saveCC,
  SubtitleSelection,
} from "../utils/subtitles";
import { loadTime, saveTime, timeKey } from "../utils/videoProgress";
import { logHls } from "../utils/telemetry";
import { slugFromTitle } from "../utils/slugFromTitle";

interface UseFullCoursePreviewOptions {
  course: Course;
  masterPlaylistSrc: string;
  apiBaseUrl: string;
  active: boolean;
}

export function useFullCoursePreview({
  course,
  masterPlaylistSrc,
  apiBaseUrl,
  active,
}: UseFullCoursePreviewOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  // Autoplay solo al inicio; respeta pausa del usuario
  const shouldAutoplayRef = useRef(true);
  const hasPlayedOnceRef = useRef(false);

  const [selectedSection, setSelectedSection] = useState(0);
  const [selectedClass, setSelectedClass] = useState(0);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(masterPlaylistSrc);
  const lastSyncedProgressRef = useRef(0);

  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleSelection>(
    () => loadCC(course.id)
  );

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

  const progressKey = useMemo(
    () => timeKey(course.id, currentSectionSlug, currentClassSlug),
    [course.id, currentSectionSlug, currentClassSlug]
  );
  /** 🔎 Helpers para navegar entre clases */
  const hasNext = useMemo(() => {
    const sec = sections[selectedSection];
    if (!sec?.classes?.length) return false;
    // ¿queda otra clase en la sección?
    if (selectedClass + 1 < (sec.classes?.length ?? 0)) return true;
    // ¿hay una sección posterior con al menos una clase?
    for (let s = selectedSection + 1; s < sections.length; s++) {
      if ((sections[s]?.classes?.length ?? 0) > 0) return true;
    }
    return false;
  }, [sections, selectedSection, selectedClass]);

  const getNextIndex = useCallback((): {
    section: number;
    cls: number;
  } | null => {
    const sec = sections[selectedSection];
    if (!sec?.classes?.length) return null;

    // siguiente clase en la misma sección
    if (selectedClass + 1 < (sec.classes?.length ?? 0)) {
      return { section: selectedSection, cls: selectedClass + 1 };
    }
    // busca la primera clase de la siguiente sección que tenga contenido
    for (let s = selectedSection + 1; s < sections.length; s++) {
      const hasClasses = (sections[s]?.classes?.length ?? 0) > 0;
      if (hasClasses) return { section: s, cls: 0 };
    }
    return null;
  }, [sections, selectedSection, selectedClass]);

  const goNext = useCallback(() => {
    const next = getNextIndex();
    if (!next) return;
    // guarda progreso del actual antes de cambiar
    const el = videoRef.current;
    if (el) saveTime(progressKey, el.currentTime);
    setSelectedSection(next.section);
    setSelectedClass(next.cls);
    setCurrentVideoSrc(buildPlaylistUrl(next.section, next.cls));
  }, [getNextIndex, buildPlaylistUrl, progressKey]);

  useEffect(() => {
    if (!active) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const onEnded = () => {
      // El controlador de UI maneja el auto-siguiente y la pantalla de fin
    };
    const onPlay = () => { hasPlayedOnceRef.current = true; };
    const onPause = () => { if (hasPlayedOnceRef.current) shouldAutoplayRef.current = false; };
    videoEl.addEventListener("ended", onEnded);
    videoEl.addEventListener("play", onPlay);
    videoEl.addEventListener("pause", onPause);

    return () => {
      videoEl.removeEventListener("ended", onEnded);
      videoEl.removeEventListener("play", onPlay);
      videoEl.removeEventListener("pause", onPause);
    };
  }, [active]);

  // Inicializa selección + URL
  useEffect(() => {
    if (!active) return;
    const initialUrl = sections.length
      ? buildPlaylistUrl(0, 0)
      : masterPlaylistSrc;
    setSelectedSection(0);
    setSelectedClass(0);
    setCurrentVideoSrc(initialUrl);
  }, [active, buildPlaylistUrl, masterPlaylistSrc, sections.length]);

  // Montaje HLS + subtítulos
  // useFullCoursePreview.ts — solo muestro el bloque relevante de "montaje HLS"
  useEffect(() => {
    if (!active) return;

    const videoEl = videoRef.current;
    if (!videoEl || !currentVideoSrc) return;

    if (hlsRef.current) {
      try {
        hlsRef.current.stopLoad();
      } catch {}
      try {
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = null;
    }

    videoEl.muted = true;
    (videoEl as any).playsInline = true;

    const applyCCSafely = () => {
      applyTextTrackSelection(videoEl, selectedSubtitle);
      // reintentos muy cortos
      queueMicrotask(() => applyTextTrackSelection(videoEl, selectedSubtitle));
      setTimeout(() => applyTextTrackSelection(videoEl, selectedSubtitle), 120);
    };

    // Re-aplica cuando cada <track> termina de cargar
    const trackEls = Array.from(
      videoEl.querySelectorAll("track[kind='subtitles']")
    ) as HTMLTrackElement[];
    const onTrackLoad = () => applyCCSafely();
    trackEls.forEach((t) => t.addEventListener("load", onTrackLoad));

    const restoreTimeAndCC = () => {
      const t = loadTime(progressKey);
      if (Number.isFinite(t) && t > 0) {
        try {
          const hasDuration = Number.isFinite(videoEl.duration);
          const maxSafe =
            hasDuration && videoEl.duration > 0
              ? Math.max(0, videoEl.duration - 0.2)
              : undefined;
          const target =
            maxSafe != null ? Math.min(Math.max(0, t), maxSafe) : Math.max(0, t);
          videoEl.currentTime = target;
        } catch {}
      }
      applyCCSafely();
    };

    const logTracks = () => {
      setTimeout(() => {
        const v = videoRef.current;
        if (!v) return;
        const tts = Array.from(v.textTracks).map((t, i) => ({
          i,
          kind: t.kind,
          lang: t.language,
          label: t.label,
          mode: t.mode,
          cues: t.cues?.length ?? 0,
        }));
        const els = Array.from(
          v.querySelectorAll('track[kind="subtitles"]')
        ).map((el: any, i) => ({
          i,
          src: el.src,
          srclang: el.srclang,
          label: el.label,
          readyState: el.readyState, // 0 NONE, 1 LOADING, 2 LOADED, 3 ERROR
        }));
        console.log("TT:", tts);
        console.log("TRACK ELs:", els);
      }, 800);
    };

    // Nudge helper to recover from small stalls/gaps near segment boundaries
    const nudgePlayback = () => {
      try {
        const v = videoEl;
        if (!v) return;
        const ct = v.currentTime || 0;
        const br = v.buffered;
        if (br && br.length) {
          // If currentTime is before the first buffered range, jump slightly into it
          for (let i = 0; i < br.length; i += 1) {
            const start = br.start(i);
            const end = br.end(i);
            if (ct >= start && ct < end) break; // already in range
            if (ct < start) { v.currentTime = Math.max(0, start + 0.05); break; }
          }
        }
        void v.play().catch(() => {});
      } catch {}
    };

    // Recover on HTMLMediaElement 'waiting'/'stalled'
    const onWaiting = () => nudgePlayback();
    const onStalled = () => nudgePlayback();
    videoEl.addEventListener("waiting", onWaiting);
    videoEl.addEventListener("stalled", onStalled);

    if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
      videoEl.crossOrigin = "use-credentials";
      videoEl.src = currentVideoSrc;
      videoEl.load();

      const onLoaded = () => {
        restoreTimeAndCC();
        if (shouldAutoplayRef.current) videoEl.play().catch(() => {});
      };
      const onAddTrack = () => applyCCSafely();
      const onCanPlay = () => applyCCSafely();

      videoEl.textTracks?.addEventListener?.("addtrack", onAddTrack as any);
      videoEl.addEventListener("loadedmetadata", onLoaded, { once: true });
      videoEl.addEventListener("canplay", onCanPlay);

      return () => {
        trackEls.forEach((t) => t.removeEventListener("load", onTrackLoad));
        videoEl.textTracks?.removeEventListener?.(
          "addtrack",
          onAddTrack as any
        );
        videoEl.removeEventListener("canplay", onCanPlay);
        clearManualTracks(videoEl);
        videoEl.removeAttribute("src");
        videoEl.load();
      };
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      xhrSetup: (xhr) => {
        xhr.withCredentials = true;
      },
    });

    const onAddTrack = () => applyCCSafely();
    videoEl.textTracks?.addEventListener?.("addtrack", onAddTrack as any);

    hls.attachMedia(videoEl);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.startLoad(0);
      hls.loadSource(currentVideoSrc);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      restoreTimeAndCC();
      if (shouldAutoplayRef.current) videoEl.play().catch(() => {});
      // logTracks();
    });

    hls.on(Hls.Events.LEVEL_LOADED, () => {
      applyCCSafely();
      // Solo intenta autoplay si aún está permitido
      if (videoEl.readyState >= 2 && videoEl.paused && shouldAutoplayRef.current) {
        videoEl.play().catch(() => {});
      }
    });

    hls.on(Hls.Events.ERROR, (_e, data) => {
      logHls({
        level: data.fatal ? "error" : "warn",
        detail: data.details,
        data,
      });
      // Non-fatal stalls: try a gentle recovery
      if (!data.fatal && (data.details === "bufferStalledError" || data.details === "bufferSeekOverHole")) {
        try { hls.startLoad(); } catch {}
        nudgePlayback();
        return;
      }
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            try {
              hls.destroy();
            } catch {}
        }
      }
    });

    hlsRef.current = hls;

    return () => {
      try {
        hls.stopLoad();
      } catch {}
      try {
        hls.destroy();
      } catch {}
      hlsRef.current = null;
      trackEls.forEach((t) => t.removeEventListener("load", onTrackLoad));
      videoEl.textTracks?.removeEventListener?.("addtrack", onAddTrack as any);
      videoEl.removeEventListener("waiting", onWaiting);
      videoEl.removeEventListener("stalled", onStalled);
      clearManualTracks(videoEl);
      videoEl.removeAttribute("src");
      videoEl.load();
    };
  }, [active, currentVideoSrc, progressKey, selectedSubtitle]);

  // Guardado periódico del progreso
  useEffect(() => {
    if (!active) return;
    const el = videoRef.current;
    if (!el) return;
    let last = 0;
    lastSyncedProgressRef.current = 0;
    const syncProgress = (positionSeconds: number, durationSeconds: number) => {
      if (!currentSectionSlug || !currentClassSlug) return;
      const now = Date.now();
      const isComplete = durationSeconds > 0 && positionSeconds / durationSeconds >= 0.98;
      // Envía cada 10s o al completar
      if (!isComplete && now - lastSyncedProgressRef.current < 10000) return;
      lastSyncedProgressRef.current = now;
      void fetch(`${apiBaseUrl}/courses/${course.id}/progress`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionSlug: currentSectionSlug,
          classSlug: currentClassSlug,
          positionSeconds: Math.floor(positionSeconds),
          durationSeconds: Math.max(1, Math.floor(durationSeconds)),
        }),
      }).catch(() => { /* silencio: no bloquea reproducción */ });
    };
    const onTime = () => {
      const now = performance.now();
      if (now - last > 1000) {
        saveTime(progressKey, el.currentTime);
        last = now;
        const dur = Number.isFinite(el.duration) ? el.duration : 0;
        if (dur > 0) syncProgress(el.currentTime, dur);
      }
    };
    const onEnded = () => {
      const dur = Number.isFinite(el.duration) ? el.duration : el.currentTime || 0;
      syncProgress(dur || el.currentTime || 0, dur || el.currentTime || 1);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, [active, apiBaseUrl, course.id, currentClassSlug, currentSectionSlug, progressKey]);

  // Persistir y aplicar selección de CC cuando el usuario cambia
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    saveCC(course.id, selectedSubtitle);
    applyTextTrackSelection(el, selectedSubtitle);
  }, [course.id, selectedSubtitle]);

  // Corrección de índices si cambia el contenido
  useEffect(() => {
    if (!sections.length) return;
    const maxSection = sections.length - 1;
    if (selectedSection > maxSection) {
      setSelectedSection(maxSection);
      setSelectedClass(0);
    } else if (
      selectedClass >= (sections[selectedSection]?.classes.length ?? 0)
    ) {
      setSelectedClass(0);
    }
  }, [sections, selectedSection, selectedClass]);

  // Cambio manual de clase/sección
  const handleSelect = useCallback(
    (sectionIndex: number, classIndex: number) => {
      const el = videoRef.current;
      if (el) saveTime(progressKey, el.currentTime);
      // permitir autoplay al cambiar de clase de forma programada
      shouldAutoplayRef.current = true;
      setSelectedSection(sectionIndex);
      setSelectedClass(classIndex);
      setCurrentVideoSrc(buildPlaylistUrl(sectionIndex, classIndex));
    },
    [buildPlaylistUrl, progressKey]
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
    currentVideoSrc,
    selectedSubtitle,
    setSelectedSubtitle,
    handleSelect,
  };
}
