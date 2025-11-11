"use client";

import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import mobileStyles from "../css/MobilePurchasedCourseContent.module.css";
import {
  Course,
  ContentSection,
  Classes,
  SubtitleTrack,
} from "@/app/interfaces/courses";
import {
  QualityLevelOption,
  QualityPreference,
} from "../hooks/useFullCoursePreview";
import VideoHitbox from "./VideoHtiBox";

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
  qualityLevels?: QualityLevelOption[];
  qualityPreference?: QualityPreference;
  onQualityChange?: (preference: QualityPreference) => void;
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
  const HIDE_DELAY_MS = 2000; // tiempo para ocultar controles
  const DBL_TAP_MS = 300; // ventana doble tap
  const SINGLE_TAP_DELAY_MS = DBL_TAP_MS + 20;
  const [tab, setTab] = useState<"clases" | "mas">("clases");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [subtitleMenuOpen, setSubtitleMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<"off" | string>(
    "off"
  );
  const [volume, setVolume] = useState(1);
  const prevVolumeRef = useRef(1);
  const [isCinema, setIsCinema] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [hideWhilePaused, setHideWhilePaused] = useState(false);
  // Overlay visible si hay controles visibles o si está en pausa y no se ha ocultado manualmente
  const overlayActive = controlsVisible || (!isPlaying && !hideWhilePaused);
  const overlayActiveRef = useRef(overlayActive);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasVisibleBeforeTapRef = useRef(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const prevWasPlayingRef = useRef(false);
  const [preview, setPreview] = useState<{
    time: number;
    ratio: number;
  } | null>(null);
  const cueLinesRef = useRef<WeakMap<any, any>>(new WeakMap());
  const lastTapTsRef = useRef(0);
  const lastTapPosRef = useRef<{ x: number; y: number } | null>(null);
  const MAX_TAP_DIST = 24; // px
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [seekHint, setSeekHint] = useState<{
    side: "left" | "right";
    id: number;
  } | null>(null);
  const pendingNavRef = useRef<{
    side: "prev" | "next";
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  // Prev/Next class targets
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

  // Sync play state and times
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => {
      setIsPlaying(true);
      setHideWhilePaused(false);
    };
    const onPause = () => {
      setIsPlaying(false);
      // setHideWhilePaused(false);
    };
    const onTime = () => setCurrentTime(video.currentTime || 0);
    const onMeta = () =>
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onVol = () => setVolume(video.volume);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("durationchange", onMeta);
    video.addEventListener("volumechange", onVol);
    // Init
    onMeta();
    onTime();
    onVol();
    setIsPlaying(!video.paused);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("durationchange", onMeta);
      video.removeEventListener("volumechange", onVol);
    };
  }, [videoRef, currentClassSlug, currentSectionSlug]);

  // Subtitles default + apply
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
  }, [currentSubtitles, currentClassSlug, currentSectionSlug]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i += 1) {
      const htmlTrack = tracks[i];
      const meta = currentSubtitles?.[i];
      const lang = meta?.lang ?? htmlTrack.language;
      if (selectedSubtitle === "off") htmlTrack.mode = "disabled";
      else htmlTrack.mode = lang === selectedSubtitle ? "showing" : "disabled";
    }
  }, [selectedSubtitle, currentSubtitles, videoRef]);

  // Mantener un ref con el estado actual de overlay para usar dentro de timeouts
  useEffect(() => {
    overlayActiveRef.current = overlayActive;
    if (!overlayActive) clearPendingNav();
  }, [overlayActive]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest("[data-cc-menu]") && subtitleMenuOpen) {
        setSubtitleMenuOpen(false);
        // Si está reproduciendo, programa ocultado tras cerrar el menú
        const video = videoRef.current;
        if (video && !video.paused) {
          hideTimerRef.current = setTimeout(
            () => setControlsVisible(false),
            HIDE_DELAY_MS
          );
        }
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [subtitleMenuOpen]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    const wasPlaying = !video.paused;
    setControlsVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (wasPlaying) {
      video.pause();
      // Al pausar, mantener controles visibles
    } else {
      void video.play();
      // Al continuar, ocultar tras el delay salvo que el menú de subtítulos esté abierto
      if (!subtitleMenuOpen) {
        hideTimerRef.current = setTimeout(
          () => setControlsVisible(false),
          HIDE_DELAY_MS
        );
      }
    }
  };

  const goNext = () => nextTarget && onSelect(nextTarget.s, nextTarget.c);
  const goPrev = () => prevTarget && onSelect(prevTarget.s, prevTarget.c);

  const clearPendingNav = () => {
    if (pendingNavRef.current) {
      clearTimeout(pendingNavRef.current.timer);
      pendingNavRef.current = null;
    }
  };

  const scheduleNav = (side: "prev" | "next") => {
    clearPendingNav();
    const timer = setTimeout(() => {
      if (pendingNavRef.current?.side === side && overlayActiveRef.current) {
        if (side === "prev") goPrev();
        else goNext();
      }
      pendingNavRef.current = null;
    }, SINGLE_TAP_DELAY_MS);
    pendingNavRef.current = { side, timer };
  };

  const EDGE_GUARD_SECONDS = 0.75; // evita caer en 0 o duración exacta
  const seekBy = (deltaSec: number, side: "left" | "right", stamp: number) => {
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
    if (seekHintTimerRef.current) clearTimeout(seekHintTimerRef.current);
    setSeekHint({ side, id: stamp });
    seekHintTimerRef.current = setTimeout(() => setSeekHint(null), 650);
  };

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

  const onSeek = (e: any) => {
    const video = videoRef.current;
    const res = getSeekFromClientX(e.clientX ?? e.touches?.[0]?.clientX ?? 0);
    if (!video || !res) return;
    video.currentTime = res.time;
    setCurrentTime(res.time);
  };

  const handleGlobalPointerMove = (e: PointerEvent) => {
    if (!isScrubbing) return;
    const res = getSeekFromClientX(e.clientX);
    if (!res) return;
    setControlsVisible(true);
    const video = videoRef.current;
    if (video) {
      video.currentTime = res.time;
    }
    setCurrentTime(res.time);
    setPreview(res);
  };

  const handleGlobalPointerUp = () => {
    if (!isScrubbing) return;
    setIsScrubbing(false);
    setPreview(null);
    // Programar ocultado si está reproduciendo
    const video = videoRef.current;
    if (prevWasPlayingRef.current && video) {
      prevWasPlayingRef.current = false;
      void video.play();
    }
    if (video && !video.paused && !subtitleMenuOpen) {
      hideTimerRef.current = setTimeout(
        () => setControlsVisible(false),
        HIDE_DELAY_MS
      );
    }
    window.removeEventListener("pointermove", handleGlobalPointerMove);
    window.removeEventListener("pointerup", handleGlobalPointerUp);
    window.removeEventListener("pointercancel", handleGlobalPointerUp);
  };

  const onProgressPointerDown = (e: any) => {
    // iniciar scrubbing
    setControlsVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setIsScrubbing(true);
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const res = getSeekFromClientX(clientX);
    const video = videoRef.current;
    if (res && video) {
      video.currentTime = res.time;
      setCurrentTime(res.time);
      setPreview(res);
    }
    // Pausar temporalmente si estaba reproduciendo
    if (video) {
      prevWasPlayingRef.current = !video.paused;
      if (prevWasPlayingRef.current) video.pause();
    }
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {}
    window.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);
  };

  // Auto-ocultar por inactividad cuando se está reproduciendo
  useEffect(() => {
    // Si no está reproduciendo, hay scrubbing o el menú de subtítulos está abierto, no programamos ocultado
    if (!isPlaying || !controlsVisible || isScrubbing || subtitleMenuOpen)
      return;
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    hideTimerRef.current = setTimeout(
      () => setControlsVisible(false),
      HIDE_DELAY_MS
    );
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [isPlaying, controlsVisible, isScrubbing, subtitleMenuOpen]);

  // Elevar subtítulos cuando los controles están visibles para evitar solapamiento con la barra
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i += 1) {
      const track = tracks[i];
      if (track.mode !== "showing") continue;
      // En algunos navegadores las cues están en track.cues
      const cues = track.cues;
      if (!cues) continue;
      for (let j = 0; j < cues.length; j += 1) {
        const cue: any = cues[j];
        if (!cue) continue;
        if (controlsVisible) {
          if (!cueLinesRef.current.has(cue))
            cueLinesRef.current.set(cue, cue.line ?? "auto");
          try {
            // Valores negativos cuentan desde abajo: -4 eleva unas líneas sobre la barra
            cue.line = -4;
          } catch {}
        } else {
          const prev = cueLinesRef.current.get(cue);
          try {
            cue.line = prev ?? "auto";
          } catch {}
          cueLinesRef.current.delete(cue);
        }
      }
    }
    return () => {
      // Restaurar si el efecto se desmonta
      const videoEl = videoRef.current;
      if (!videoEl) return;
      const tks = videoEl.textTracks;
      for (let i = 0; i < tks.length; i += 1) {
        const cues = tks[i].cues;
        if (!cues) continue;
        for (let j = 0; j < cues.length; j += 1) {
          const cue: any = cues[j];
          const prev = cueLinesRef.current.get(cue);
          try {
            cue.line = prev ?? "auto";
          } catch {}
        }
      }
    };
  }, [controlsVisible, selectedSubtitle, currentClassSlug, currentSectionSlug]);

  const onVideoPointerDown = (e: any) => {
    const now = Date.now();
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    const prev = lastTapPosRef.current;
    const isNearPrev =
      !!prev && Math.hypot(prev.x - x, prev.y - y) <= MAX_TAP_DIST;

    // --- DOBLE TAP ---
    if (isNearPrev && now - lastTapTsRef.current < DBL_TAP_MS) {
      e.preventDefault?.();
      e.stopPropagation?.();

      // 1) cancelamos el single-tap pendiente (para que no haga toggle)
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }

      // 2) hacemos el seek ±5s
      const area = shellRef.current || (e.currentTarget as HTMLElement);
      const rect = area.getBoundingClientRect();
      const ratio = rect.width ? (x - rect.left) / rect.width : 0.5;
      const forward = ratio >= 0.5;
      seekBy(forward ? 5 : -5, forward ? "right" : "left", now);

      // 3) si antes del primer tap el overlay estaba oculto, lo mantenemos oculto
      if (!wasVisibleBeforeTapRef.current) {
        setControlsVisible(false);
        setHideWhilePaused((p) => p); // no tocamos estado de pausa
      }

      // limpiar estado de doble tap
      lastTapTsRef.current = 0;
      lastTapPosRef.current = null;
      clearPendingNav();
      return;
    }

    // --- PRIMER TAP (posible single) ---
    // guardamos cómo estaba antes del primer tap
    wasVisibleBeforeTapRef.current = overlayActiveRef.current;

    // agendamos el single-tap: si no llega un segundo tap a tiempo, hacemos toggle
    if (singleTapTimerRef.current) {
      clearTimeout(singleTapTimerRef.current);
    }
    singleTapTimerRef.current = setTimeout(() => {
      // SINGLE TAP efectivo: toggle visibilidad
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      const currentlyVisible = overlayActiveRef.current;
      if (currentlyVisible) {
        setControlsVisible(false);
        if (!isPlaying) setHideWhilePaused(true);
      } else {
        setHideWhilePaused(false);
        setControlsVisible(true);
        // si está reproduciendo, programa auto-ocultar
        if (isPlaying && !subtitleMenuOpen) {
          hideTimerRef.current = setTimeout(
            () => setControlsVisible(false),
            HIDE_DELAY_MS
          );
        }
      }
      singleTapTimerRef.current = null;
    }, DBL_TAP_MS);

    // marcamos este tap como el "primero" potencial
    lastTapTsRef.current = now;
    lastTapPosRef.current = { x, y };
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
      if (seekHintTimerRef.current) clearTimeout(seekHintTimerRef.current);
      clearPendingNav();
    };
  }, []);

  // Fullscreen helpers
  useEffect(() => {
    const onFsChange = () => {
      const anyDoc: any = document as any;
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

  const toggleFullscreen = async () => {
    const container = shellRef.current || videoRef.current;
    if (!container) return;
    const anyDoc: any = document as any;
    try {
      if (!document.fullscreenElement && !anyDoc.webkitFullscreenElement) {
        const anyEl: any = container as any;
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
      // ignore runtime fullscreen errors
    }
  };

  const onVolumeChange = (e: any) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.min(1, Math.max(0, Number(e.target.value) / 100));
    video.volume = next;
    if (next > 0) prevVolumeRef.current = next;
    setVolume(next);
    if (video.muted && next > 0) video.muted = false;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted || volume === 0) {
      const restore = prevVolumeRef.current || 1;
      video.muted = false;
      video.volume = restore;
      setVolume(restore);
    } else {
      prevVolumeRef.current = volume || 1;
      video.muted = true;
      video.volume = 0;
      setVolume(0);
    }
  };

  return (
    <section className={mobileStyles.mobileCourseLayout}>
      <header className={mobileStyles.mobileStickyHeader}>
        <div
          ref={shellRef}
          className={`${mobileStyles.mobilePlayerShell} ${
            isCinema ? mobileStyles.cinema : ""
          }`}
        >
          <video
            ref={videoRef}
            crossOrigin="use-credentials"
            className={mobileStyles.mobilePlayerVideo}
            playsInline
            controls={false}
            // onPointerDown={onVideoPointerDown}
            // onDoubleClick={(e) => {
            //   e.preventDefault();
            //   e.stopPropagation();
            //   return false as unknown as void;
            // }}
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
                  default={false}
                />
              ))}
          </video>
          <VideoHitbox
            isOverlayVisible={overlayActive}
            onTap={onVideoPointerDown}
          />
          <div className={mobileStyles.ccTopRight}>
            <button
              type="button"
              className={`${mobileStyles.ccButton} ${
                selectedSubtitle !== "off" ? mobileStyles.ccActive : ""
              }`}
              onClick={() => {
                if (!currentSubtitles?.length) return;
                // alternar entre activar o desactivar subtítulos rápidos
                setSelectedSubtitle((prev) =>
                  prev === "off" ? currentSubtitles[0]?.lang ?? "off" : "off"
                );
              }}
              aria-label="Subtítulos"
            >
              CC
            </button>

            {/* ⚙️ Nuevo botón de ajustes */}
            <button
              type="button"
              className={mobileStyles.settingsButton}
              onClick={() => setSettingsModalOpen(true)}
              aria-label="Configuración del video"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                className="bi bi-gear"
                viewBox="0 0 16 16"
              >
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
              </svg>
            </button>
          </div>

          {/* Double-tap seek feedback */}
          <div
            className={`${mobileStyles.seekHint} ${
              seekHint
                ? seekHint.side === "left"
                  ? mobileStyles.seekLeft
                  : mobileStyles.seekRight
                : ""
            } ${seekHint ? mobileStyles.seekHintVisible : ""}`}
            // Changing key forces animation restart on consecutive hints
            key={seekHint?.id ?? 0}
            aria-hidden={true}
          >
            <div className={mobileStyles.seekBubble}>
              {seekHint?.side === "right" ? "⏩ +5s" : "⏪ -5s"}
            </div>
          </div>

          {/* Gesture layer for taps/double-taps when controls are ocultos */}
          {/* <div
            className={mobileStyles.gestureLayer}
            onPointerDown={onVideoPointerDown}
            aria-hidden={true}
          /> */}

          {/* Overlay controls */}
          <div
            className={`${mobileStyles.overlay} ${
              overlayActive ? mobileStyles.overlayVisible : ""
            }`}
          >
            {/* 🔹 Fondo clicable cuando el overlay está visible */}
            <div
              className={mobileStyles.overlayBackdrop}
              onPointerDown={(e) => {
                // este fondo recibe taps para toggle/±5s mientras los controles están visibles
                e.preventDefault();
                e.stopPropagation();
                onVideoPointerDown(e);
              }}
              aria-hidden
            />
            <div
              className={mobileStyles.overlayCenter}
              onPointerDown={(e) => {
                // Si se pulsa en un botón, no tratar como tap/seek
                const el = e.target as HTMLElement;
                if (el.closest("button")) e.stopPropagation();
              }}
            >
              <button
                type="button"
                className={`${mobileStyles.navButton} ${mobileStyles.navLeft}`}
                onPointerDown={(e) => {
                  if (!overlayActive) return;
                  const now = Date.now();
                  // doble tap en botón izquierdo => retroceder 5s
                  if (now - lastTapTsRef.current < DBL_TAP_MS) {
                    e.preventDefault();
                    e.stopPropagation();
                    clearPendingNav();
                    seekBy(-5, "left", now);
                    lastTapTsRef.current = 0;
                    return;
                  }
                  lastTapTsRef.current = now;
                }}
                onClick={(e) => {
                  if (!overlayActive) return;
                  // retrasar navegación para permitir detectar doble tap
                  e.preventDefault();
                  e.stopPropagation();
                  scheduleNav("prev");
                }}
                disabled={!prevTarget || !overlayActive}
                aria-label="Clase anterior"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  fill="currentColor"
                  className="bi bi-skip-start-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M4 4a.5.5 0 0 1 1 0v3.248l6.267-3.636c.54-.313 1.232.066 1.232.696v7.384c0 .63-.692 1.01-1.232.697L5 8.753V12a.5.5 0 0 1-1 0z" />
                </svg>
              </button>
              <button
                type="button"
                className={mobileStyles.centerPlay}
                onClick={togglePlay}
                disabled={!overlayActive}
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    fill="currentColor"
                    className="bi bi-pause-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    fill="currentColor"
                    className="bi bi-play-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                className={`${mobileStyles.navButton} ${mobileStyles.navRight}`}
                onPointerDown={(e) => {
                  if (!overlayActive) return;
                  const now = Date.now();
                  // doble tap en botón derecho => avanzar 5s
                  if (now - lastTapTsRef.current < DBL_TAP_MS) {
                    e.preventDefault();
                    e.stopPropagation();
                    clearPendingNav();
                    seekBy(5, "right", now);
                    lastTapTsRef.current = 0;
                    return;
                  }
                  lastTapTsRef.current = now;
                }}
                onClick={(e) => {
                  if (!overlayActive) return;
                  // retrasar navegación para permitir detectar doble tap
                  e.preventDefault();
                  e.stopPropagation();
                  scheduleNav("next");
                }}
                disabled={!nextTarget || !overlayActive}
                aria-label="Siguiente clase"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  fill="currentColor"
                  className="bi bi-skip-end-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.693 3.3 4 3.678 4 4.308v7.384c0 .63.692 1.01 1.233.697L11.5 8.753V12a.5.5 0 0 0 1 0z" />
                </svg>
              </button>
            </div>

            <div
              className={mobileStyles.bottomControls}
              onPointerDown={(e) => {
                const el = e.target as HTMLElement;
                if (el.closest('button, input, [role="slider"]'))
                  e.stopPropagation();
              }}
            >
              <div
                ref={progressRef}
                className={mobileStyles.progress}
                onClick={onSeek}
                onPointerDown={onProgressPointerDown}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={Math.floor(duration)}
                aria-valuenow={Math.floor(currentTime)}
                aria-label="Progreso del video"
              >
                <div className={mobileStyles.progressTrack} />
                <div
                  className={mobileStyles.progressFill}
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
                <div
                  className={mobileStyles.progressThumb}
                  style={{
                    left: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
                {isScrubbing && preview && (
                  <div
                    className={mobileStyles.progressPreview}
                    style={{ left: `${preview.ratio * 100}%` }}
                  >
                    {formatTimeLabel(preview.time)}
                  </div>
                )}
              </div>
              <div className={mobileStyles.bottomMeta}>
                <span>
                  {formatTimeLabel(currentTime)} / {formatTimeLabel(duration)}
                </span>
                <div className={mobileStyles.bottomRight}>
                  <button
                    type="button"
                    className={mobileStyles.iconButton}
                    onClick={toggleFullscreen}
                    aria-label={
                      isFullscreen
                        ? "Salir de pantalla completa"
                        : "Pantalla completa"
                    }
                  >
                    {isFullscreen ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        className="bi bi-fullscreen-exit"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        className="bi bi-fullscreen"
                        viewBox="0 0 16 16"
                      >
                        <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={mobileStyles.mobileCourseInfo}>
          <p className={mobileStyles.mobileEyebrow}>Curso completo</p>
          <h2>{course.title}</h2>
          <span className={mobileStyles.mobileInstructor}>
            Equipo Combat Strike
          </span>
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
      </header>

      <div className={mobileStyles.mobileScrollableContent}>
        {tab === "clases" && (
          <div className={mobileStyles.mobileSectionList}>
            {sections.map((section, sectionIdx) => (
              <div
                key={section.sectionTitle}
                className={mobileStyles.mobileSectionCard}
              >
                <header className={mobileStyles.mobileSectionHeader}>
                  <div>
                    <span className={mobileStyles.mobileSectionLabel}>
                      Sección {sectionIdx + 1}
                    </span>
                    <h3>{section.sectionTitle}</h3>
                  </div>
                  <span className={mobileStyles.mobileSectionMeta}>
                    {section.classes.length} clases
                  </span>
                </header>
                <ul>
                  {section.classes.map((cls, classIdx) => {
                    const isActive =
                      selectedSection === sectionIdx &&
                      selectedClass === classIdx;
                    return (
                      <li key={`${section.sectionTitle}-${classIdx}`}>
                        <button
                          type="button"
                          onClick={() => onSelect(sectionIdx, classIdx)}
                          className={`${mobileStyles.mobileClassButton} ${
                            isActive ? mobileStyles.mobileClassButtonActive : ""
                          }`}
                        >
                          <span className={mobileStyles.mobileClassIndex}>
                            {classIdx + 1}
                          </span>
                          <div>
                            <p>{cls.title}</p>
                            <small>
                              Video ·{" "}
                              {formatDuration(
                                cls.duration.hours,
                                cls.duration.minutes
                              )}
                            </small>
                          </div>
                          <span
                            className={mobileStyles.mobileClassIcon}
                            aria-hidden="true"
                          >
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
                {totalSections} secciones · {totalClasses} clases ·{" "}
                {durationHours} h {durationMinutes} min
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
      </div>

      {settingsModalOpen && (
        <div
          className={mobileStyles.settingsModalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSettingsModalOpen(false);
          }}
        >
          <div className={mobileStyles.settingsModal}>
            <header className={mobileStyles.settingsHeader}>
              <h3>Configuración del video</h3>
              <button
                className={mobileStyles.closeSettings}
                onClick={() => setSettingsModalOpen(false)}
                aria-label="Cerrar configuración"
              >
                ✕
              </button>
            </header>

            <div className={mobileStyles.settingsSection}>
              <span className={mobileStyles.settingsLabel}>Subtítulos</span>
              <ul className={mobileStyles.settingsList}>
                <li>
                  <button
                    onClick={() => {
                      setSelectedSubtitle("off");
                      setSettingsModalOpen(false);
                    }}
                    className={
                      selectedSubtitle === "off"
                        ? mobileStyles.settingsActive
                        : ""
                    }
                  >
                    Desactivados
                  </button>
                </li>
                {currentSubtitles?.map((t) => (
                  <li key={t.lang}>
                    <button
                      onClick={() => {
                        setSelectedSubtitle(t.lang);
                        setSettingsModalOpen(false);
                      }}
                      className={
                        selectedSubtitle === t.lang
                          ? mobileStyles.settingsActive
                          : ""
                      }
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Puedes añadir más configuraciones aquí, como calidad */}
          </div>
        </div>
      )}
    </section>
  );
}
