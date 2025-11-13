"use client";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  SubtitleTrack,
  ContentSection,
  Classes,
} from "@/app/interfaces/courses";

type ControllerArgs = {
  videoRef: RefObject<HTMLVideoElement | null>;
  sections: ContentSection[];
  selectedSection: number;
  selectedClass: number;
  onSelect: (s: number, c: number) => void;
  currentSubtitles: SubtitleTrack[];
};

export function useVideoController({
  videoRef,
  sections,
  selectedSection,
  selectedClass,
  onSelect,
  currentSubtitles,
}: ControllerArgs) {
  // --- Constantes de UX ---
  const HIDE_DELAY_MS = 2000;
  const DBL_TAP_MS = 300;
  const SINGLE_TAP_DELAY_MS = DBL_TAP_MS + 20;
  const MAX_TAP_DIST = 24;
  const EDGE_GUARD_SECONDS = 0.75;

  // --- Estado ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedSubtitle, setSelectedSubtitle] = useState<"off" | string>(
    "off"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [controlsVisible, setControlsVisible] = useState(false);
  const [hideWhilePaused, setHideWhilePaused] = useState(false);
  const [progressOnly, setProgressOnly] = useState(false);
  const progressOnlyRef = useRef(false);
  useEffect(() => { progressOnlyRef.current = progressOnly; }, [progressOnly]);
  const overlayActive = controlsVisible || (!isPlaying && !hideWhilePaused);

  // --- Refs que no disparan renders ---
  const shellRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const overlayActiveRef = useRef(overlayActive);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [seekHint, setSeekHint] = useState<{
    side: "left" | "right";
    id: number;
  } | null>(null);
  const seekHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTsRef = useRef(0);
  const lastTapPosRef = useRef<{ x: number; y: number } | null>(null);
  const wasVisibleBeforeTapRef = useRef(false);

  const isScrubbingRef = useRef(false);
  const prevWasPlayingRef = useRef(false);

  const pendingNavRef = useRef<{
    side: "prev" | "next";
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  // --- Preview de scrubbing (solo para UI) ---
  const [preview, setPreview] = useState<{
    time: number;
    ratio: number;
  } | null>(null);

  // --- Siguientes/anteriores clases ---
  const nextTarget = useMemo(() => {
    const sec = sections[selectedSection];
    if (!sec) return null;
    if (selectedClass + 1 < sec.classes.length)
      return { s: selectedSection, c: selectedClass + 1 };
    if (selectedSection + 1 < sections.length)
      return { s: selectedSection + 1, c: 0 };
    return null;
  }, [sections, selectedSection, selectedClass]);

  const prevTarget = useMemo(() => {
    const sec = sections[selectedSection];
    if (!sec) return null;
    if (selectedClass - 1 >= 0)
      return { s: selectedSection, c: selectedClass - 1 };
    if (selectedSection - 1 >= 0) {
      const prev = sections[selectedSection - 1];
      if (prev?.classes?.length)
        return { s: selectedSection - 1, c: prev.classes.length - 1 };
    }
    return null;
  }, [sections, selectedSection, selectedClass]);

  const hasNext = !!nextTarget;
  const hasPrev = !!prevTarget;

  // --- Sync de video ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      setHideWhilePaused(false);
    };
    const onPause = () => {
      setIsPlaying(false); /* mantener hideWhilePaused como esté */
    };
    const onTime = () => setCurrentTime(video.currentTime || 0);
    const onMeta = () =>
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onVol = () => {
      /* no guardamos aquí el volumen global; fuera del alcance */
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("durationchange", onMeta);
    video.addEventListener("volumechange", onVol);

    // init
    onMeta();
    onTime();
    setIsPlaying(!video.paused);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("durationchange", onMeta);
      video.removeEventListener("volumechange", onVol);
    };
  }, [videoRef]);

  // Subtítulos por defecto
  useEffect(() => {
    if (!currentSubtitles?.length) {
      setSelectedSubtitle("off");
      return;
    }
    setSelectedSubtitle((prev) => {
      if (prev !== "off" && currentSubtitles.some((t) => t.lang === prev))
        return prev;
      const es = currentSubtitles.find((t) => t.lang === "es");
      return (es?.lang ?? currentSubtitles[0].lang) as string;
    });
  }, [currentSubtitles]);

  // Aplicar subtítulos al <video> y reintentar cuando se agregan pistas
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const apply = () => {
      const tracks = video.textTracks;
      for (let i = 0; i < tracks.length; i += 1) {
        const htmlTrack = tracks[i];
        const meta = currentSubtitles?.[i];
        const lang = (meta?.lang || htmlTrack.language || "").toLowerCase();
        if (selectedSubtitle === "off") {
          htmlTrack.mode = "disabled" as TextTrackMode;
        } else {
          const want = selectedSubtitle.toLowerCase();
          const match = lang === want || lang.startsWith(want);
          htmlTrack.mode = match ? ("showing" as TextTrackMode) : ("disabled" as TextTrackMode);
        }
      }
    };
    apply();

    const onAdd = () => apply();
    try {
      video.textTracks?.addEventListener?.("addtrack", onAdd as any);
    } catch {}
    return () => {
      try { video.textTracks?.removeEventListener?.("addtrack", onAdd as any); } catch {}
    };
  }, [selectedSubtitle, currentSubtitles, videoRef]);

  // Mantener overlay ref actualizado
  useEffect(() => {
    overlayActiveRef.current = overlayActive;
    if (!overlayActive) {
      if (pendingNavRef.current) {
        clearTimeout(pendingNavRef.current.timer);
        pendingNavRef.current = null;
      }
    }
  }, [overlayActive]);

  // Auto-ocultar cuando se reproduce y los controles están visibles
  useEffect(() => {
    if (!isPlaying || !controlsVisible || isScrubbingRef.current) return;
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
      setProgressOnly(false);
    }, HIDE_DELAY_MS);
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [isPlaying, controlsVisible]);

  // Fullscreen change
  useEffect(() => {
    const onFsChange = () => {
      const anyDoc: any = document;
      const isFs = !!(
        document.fullscreenElement ||
        anyDoc.webkitFullscreenElement ||
        anyDoc.msFullscreenElement
      );
      setIsFullscreen(isFs);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange as any);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange as any);
    };
  }, []);
  useEffect(() => {
    return () => {
      if (seekHintTimerRef.current) clearTimeout(seekHintTimerRef.current);
    };
  }, []);

  // --- Helpers de UI ---
  const formatTimeLabel = (val: number) => {
    if (!Number.isFinite(val)) return "0:00";
    const s = Math.floor(val % 60)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((val / 60) % 60).toString();
    const h = Math.floor(val / 3600);
    return h > 0 ? `${h}:${m.padStart(2, "0")}:${s}` : `${m}:${s}`;
  };

  const getSeekFromClientX = (clientX: number) => {
    const bar = progressRef.current;
    if (!bar || !duration) return null;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return { ratio, time: ratio * duration } as const;
  };

  // --- Acciones ---
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    const wasPlaying = !video.paused;

    setControlsVisible(true);
    setProgressOnly(false);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (wasPlaying) {
      video.pause();
    } else {
      void video.play();
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
        setProgressOnly(false);
      }, HIDE_DELAY_MS);
    }
  };

  const goNext = () => nextTarget && onSelect(nextTarget.s, nextTarget.c);
  const goPrev = () => prevTarget && onSelect(prevTarget.s, prevTarget.c);

  const scheduleNav = (side: "prev" | "next") => {
    if (pendingNavRef.current) {
      clearTimeout(pendingNavRef.current.timer);
      pendingNavRef.current = null;
    }
    const timer = setTimeout(() => {
      if (pendingNavRef.current?.side === side && overlayActiveRef.current) {
        if (side === "prev") goPrev();
        else goNext();
      }
      pendingNavRef.current = null;
    }, SINGLE_TAP_DELAY_MS);
    pendingNavRef.current = { side, timer };
  };

  const revealProgressBriefly = () => {
    setHideWhilePaused(false);
    setProgressOnly(true);
    setControlsVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    hideTimerRef.current = setTimeout(() => {
      const isPaused = videoRef.current?.paused;
      if (!isPaused) setControlsVisible(false);
      setProgressOnly(false);
    }, HIDE_DELAY_MS);
  };

  // reemplaza tu seekBy por esta versión
  const seekBy = (
    deltaSec: number,
    side: "left" | "right",
    stamp: number = Date.now()
  ) => {
    const video = videoRef.current;
    if (!video) return;
    const dur =
      Number.isFinite(duration) && duration > 0
        ? duration
        : video.duration || 0;
    let next = (video.currentTime || 0) + deltaSec;
    if (dur > 0) {
      const maxSafe = Math.max(EDGE_GUARD_SECONDS, dur - EDGE_GUARD_SECONDS);
      const minSafe = EDGE_GUARD_SECONDS;
      next = Math.min(maxSafe, Math.max(minSafe, next));
    }
    video.currentTime = next;
    setCurrentTime(next);

    // hint
    if (seekHintTimerRef.current) clearTimeout(seekHintTimerRef.current);
    setSeekHint({ side, id: stamp });
    seekHintTimerRef.current = setTimeout(() => setSeekHint(null), 650);
  };

  const onSeek = (
    e: React.MouseEvent | React.PointerEvent | React.TouchEvent
  ) => {
    const clientX = (e as any).clientX ?? (e as any).touches?.[0]?.clientX ?? 0;
    const video = videoRef.current;
    const res = getSeekFromClientX(clientX);
    if (!video || !res) return;
    video.currentTime = res.time;
    setCurrentTime(res.time);
  };

  const handleGlobalPointerMove = (e: PointerEvent) => {
    if (!isScrubbingRef.current) return;
    const res = getSeekFromClientX(e.clientX);
    if (!res) return;
    setControlsVisible(true);
    const video = videoRef.current;
    if (video) video.currentTime = res.time;
    setCurrentTime(res.time);
    setPreview(res);
  };

  const handleGlobalPointerUp = () => {
    if (!isScrubbingRef.current) return;
    isScrubbingRef.current = false;
    setPreview(null);
    const video = videoRef.current;
    if (prevWasPlayingRef.current && video) {
      prevWasPlayingRef.current = false;
      void video.play();
    }
    if (video && !video.paused) {
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
        setProgressOnly(false);
      }, HIDE_DELAY_MS);
    }
    window.removeEventListener("pointermove", handleGlobalPointerMove);
    window.removeEventListener("pointerup", handleGlobalPointerUp);
    window.removeEventListener("pointercancel", handleGlobalPointerUp);
  };

  const onProgressPointerDown = (e: React.PointerEvent) => {
    setControlsVisible(true);
    setProgressOnly(false);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    isScrubbingRef.current = true;

    const clientX = (e as any).clientX ?? (e as any).touches?.[0]?.clientX ?? 0;
    const res = getSeekFromClientX(clientX);
    const video = videoRef.current;
    if (res && video) {
      video.currentTime = res.time;
      setCurrentTime(res.time);
      setPreview(res);
      prevWasPlayingRef.current = !video.paused;
      if (prevWasPlayingRef.current) video.pause();
    }

    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(
        (e as any).pointerId
      );
    } catch {}
    window.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);
  };

  const onVideoPointerDown = (e: any) => {
    const now = Date.now();
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    const prev = lastTapPosRef.current;
    const isNearPrev =
      !!prev && Math.hypot(prev.x - x, prev.y - y) <= MAX_TAP_DIST;

    // Doble tap => ±5s y mostramos la barra brevemente
    if (isNearPrev && now - lastTapTsRef.current < DBL_TAP_MS) {
      e.preventDefault?.();
      e.stopPropagation?.();
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }

      const area = shellRef.current || (e.currentTarget as HTMLElement);
      const rect = area.getBoundingClientRect();
      const ratio = rect.width ? (x - rect.left) / rect.width : 0.5;
      const forward = ratio >= 0.5;
      seekBy(forward ? 5 : -5, forward ? "right" : "left", now);

      revealProgressBriefly();
      lastTapTsRef.current = 0;
      lastTapPosRef.current = null;
      if (pendingNavRef.current) {
        clearTimeout(pendingNavRef.current.timer);
        pendingNavRef.current = null;
      }
      return;
    }

    // Primer tap (posible single)
    wasVisibleBeforeTapRef.current = overlayActiveRef.current;

    if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
    singleTapTimerRef.current = setTimeout(() => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      // Si estamos en modo solo-progreso, promover a controles completos
      if (progressOnlyRef.current) {
        setProgressOnly(false);
        setHideWhilePaused(false);
        setControlsVisible(true);
        if (isPlaying) {
          hideTimerRef.current = setTimeout(() => {
            setControlsVisible(false);
            setProgressOnly(false);
          }, HIDE_DELAY_MS);
        }
        singleTapTimerRef.current = null;
        return;
      }

      const currentlyVisible = overlayActiveRef.current;
      if (currentlyVisible) {
        setControlsVisible(false);
        setProgressOnly(false);
        if (!isPlaying) setHideWhilePaused(true);
      } else {
        setProgressOnly(false);
        setHideWhilePaused(false);
        setControlsVisible(true);
        if (isPlaying) {
          hideTimerRef.current = setTimeout(() => {
            setControlsVisible(false);
            setProgressOnly(false);
          }, HIDE_DELAY_MS);
        }
      }
      singleTapTimerRef.current = null;
    }, DBL_TAP_MS);

    lastTapTsRef.current = now;
    lastTapPosRef.current = { x, y };
  };

  const toggleFullscreen = async () => {
    const container = shellRef.current || videoRef.current;
    if (!container) return;
    const anyDoc: any = document;
    try {
      if (!document.fullscreenElement && !anyDoc.webkitFullscreenElement) {
        const anyEl: any = container;
        if (anyEl.requestFullscreen) await anyEl.requestFullscreen();
        else if (anyEl.webkitRequestFullscreen)
          await anyEl.webkitRequestFullscreen();
        else if ((videoRef.current as any)?.webkitEnterFullscreen)
          (videoRef.current as any).webkitEnterFullscreen();
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (anyDoc.webkitExitFullscreen)
          await anyDoc.webkitExitFullscreen();
      }
    } catch {
      /* noop */
    }
  };

  // Exponer API al exterior
  return {
    // estado/valores
    overlayActive,
    isPlaying,
    currentTime,
    duration,
    isFullscreen,
    selectedSubtitle,
    preview,

    // refs para asignar
    shellRef, // contenedor del player
    progressRef, // barra de progreso

    // banderas
    hasPrev,
    hasNext,

    // helpers
    formatTimeLabel,

    // acciones
    onVideoPointerDown,
    onSeek,
    onProgressPointerDown,
    togglePlay,
    goPrev,
    goNext,
    scheduleNav,
    toggleFullscreen,
    setSelectedSubtitle,
    seekHint,
    progressOnly,
  };
}
