"use client";

import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import mobileStyles from "../css/MobilePurchasedCourseContent.module.css";
import { Course, ContentSection, Classes, SubtitleTrack } from "@/app/interfaces/courses";
import { QualityLevelOption, QualityPreference } from "../hooks/useFullCoursePreview";

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
    const [tab, setTab] = useState<"clases" | "mas">("clases");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [subtitleMenuOpen, setSubtitleMenuOpen] = useState(false);
    const [selectedSubtitle, setSelectedSubtitle] = useState<"off" | string>("off");
    const [volume, setVolume] = useState(1);
    const prevVolumeRef = useRef(1);
    const [isCinema, setIsCinema] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const shellRef = useRef<HTMLDivElement>(null);
    const [controlsVisible, setControlsVisible] = useState(false);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);
    const prevWasPlayingRef = useRef(false);
    const [preview, setPreview] = useState<{ time: number; ratio: number } | null>(null);
    const cueLinesRef = useRef<WeakMap<any, any>>(new WeakMap());

    // Prev/Next class targets
    const nextTarget = useMemo(() => {
        const sec = sections[selectedSection];
        if (!sec) return null;
        if (selectedClass + 1 < sec.classes.length) return { s: selectedSection, c: selectedClass + 1 };
        if (selectedSection + 1 < sections.length) return { s: selectedSection + 1, c: 0 };
        return null;
    }, [sections, selectedSection, selectedClass]);

    const prevTarget = useMemo(() => {
        const sec = sections[selectedSection];
        if (!sec) return null;
        if (selectedClass - 1 >= 0) return { s: selectedSection, c: selectedClass - 1 };
        if (selectedSection - 1 >= 0) {
            const prev = sections[selectedSection - 1];
            if (prev?.classes?.length) return { s: selectedSection - 1, c: prev.classes.length - 1 };
        }
        return null;
    }, [sections, selectedSection, selectedClass]);

    // Sync play state and times
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onTime = () => setCurrentTime(video.currentTime || 0);
        const onMeta = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
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
            if (prev !== "off" && currentSubtitles.some((t) => t.lang === prev)) return prev;
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

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            if (!target.closest('[data-cc-menu]') && subtitleMenuOpen) {
                setSubtitleMenuOpen(false);
                // Si está reproduciendo, programa ocultado tras cerrar el menú
                const video = videoRef.current;
                if (video && !video.paused) {
                    hideTimerRef.current = setTimeout(() => setControlsVisible(false), HIDE_DELAY_MS);
                }
            }
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
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
                hideTimerRef.current = setTimeout(() => setControlsVisible(false), HIDE_DELAY_MS);
            }
        }
    };

    const goNext = () => nextTarget && onSelect(nextTarget.s, nextTarget.c);
    const goPrev = () => prevTarget && onSelect(prevTarget.s, prevTarget.c);

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
            hideTimerRef.current = setTimeout(() => setControlsVisible(false), HIDE_DELAY_MS);
        }
        window.removeEventListener('pointermove', handleGlobalPointerMove);
        window.removeEventListener('pointerup', handleGlobalPointerUp);
        window.removeEventListener('pointercancel', handleGlobalPointerUp);
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
        try { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); } catch {}
        window.addEventListener('pointermove', handleGlobalPointerMove);
        window.addEventListener('pointerup', handleGlobalPointerUp);
        window.addEventListener('pointercancel', handleGlobalPointerUp);
    };

    // Auto-ocultar por inactividad cuando se está reproduciendo
    useEffect(() => {
        // Si no está reproduciendo, hay scrubbing o el menú de subtítulos está abierto, no programamos ocultado
        if (!isPlaying || !controlsVisible || isScrubbing || subtitleMenuOpen) return;
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
        hideTimerRef.current = setTimeout(() => setControlsVisible(false), HIDE_DELAY_MS);
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
            if (track.mode !== 'showing') continue;
            // En algunos navegadores las cues están en track.cues
            const cues = track.cues;
            if (!cues) continue;
            for (let j = 0; j < cues.length; j += 1) {
                const cue: any = cues[j];
                if (!cue) continue;
                if (controlsVisible) {
                    if (!cueLinesRef.current.has(cue)) cueLinesRef.current.set(cue, cue.line ?? 'auto');
                    try {
                        // Valores negativos cuentan desde abajo: -4 eleva unas líneas sobre la barra
                        cue.line = -4;
                    } catch {}
                } else {
                    const prev = cueLinesRef.current.get(cue);
                    try {
                        cue.line = prev ?? 'auto';
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
                    try { cue.line = prev ?? 'auto'; } catch {}
                }
            }
        };
    }, [controlsVisible, selectedSubtitle, currentClassSlug, currentSectionSlug]);

    const onVideoPointerDown = () => {
        // Mostrar controles al tocar el video
        setControlsVisible(true);
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
        // Si está reproduciendo, prográmalo para ocultar en 0.5s
        const video = videoRef.current;
        if (video && !video.paused && !subtitleMenuOpen) {
            hideTimerRef.current = setTimeout(() => setControlsVisible(false), HIDE_DELAY_MS);
        }
    };

    // Fullscreen helpers
    useEffect(() => {
        const onFsChange = () => {
            const anyDoc: any = document as any;
            const isFs = !!(document.fullscreenElement || anyDoc.webkitFullscreenElement || anyDoc.msFullscreenElement);
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
                else if (anyEl.webkitRequestFullscreen) await anyEl.webkitRequestFullscreen();
                else if ((videoRef.current as any)?.webkitEnterFullscreen) (videoRef.current as any).webkitEnterFullscreen();
            } else {
                if (document.exitFullscreen) await document.exitFullscreen();
                else if (anyDoc.webkitExitFullscreen) await anyDoc.webkitExitFullscreen();
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
                <div ref={shellRef} className={`${mobileStyles.mobilePlayerShell} ${isCinema ? mobileStyles.cinema : ""}`}>
                    <video
                        ref={videoRef}
                        crossOrigin="use-credentials"
                        className={mobileStyles.mobilePlayerVideo}
                        playsInline
                        controls={false}
                        onClick={togglePlay}
                        onPointerDown={onVideoPointerDown}
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

                    {/* Overlay controls */}
                    <div className={`${mobileStyles.overlay} ${controlsVisible || !isPlaying ? mobileStyles.overlayVisible : ""}`}>
                        <div className={mobileStyles.overlayCenter}>
                            <button
                                type="button"
                                className={`${mobileStyles.navButton} ${mobileStyles.navLeft}`}
                                onClick={goPrev}
                                disabled={!prevTarget}
                                aria-label="Clase anterior"
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                className={mobileStyles.centerPlay}
                                onClick={togglePlay}
                                aria-label={isPlaying ? "Pausar" : "Reproducir"}
                            >
                                {isPlaying ? "❚❚" : "▶"}
                            </button>
                            <button
                                type="button"
                                className={`${mobileStyles.navButton} ${mobileStyles.navRight}`}
                                onClick={goNext}
                                disabled={!nextTarget}
                                aria-label="Siguiente clase"
                            >
                                ›
                            </button>
                        </div>

                        <div className={mobileStyles.bottomControls}>
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
                                <div className={mobileStyles.progressFill} style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                                <div className={mobileStyles.progressThumb} style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
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
                                <span>{formatTimeLabel(currentTime)} / {formatTimeLabel(duration)}</span>
                                <div className={mobileStyles.bottomRight}>
                                    <div className={mobileStyles.volumeGroup}>
                                        <button
                                            type="button"
                                            className={mobileStyles.volumeIcon}
                                            aria-label={volume === 0 ? "Activar sonido" : "Silenciar"}
                                            onClick={toggleMute}
                                        >
                                            {volume === 0 ? "🔇" : volume < 0.5 ? "🔈" : "🔊"}
                                        </button>
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            value={Math.round(volume * 100)}
                                            onChange={onVolumeChange}
                                            className={mobileStyles.volumeSlider}
                                            aria-label="Volumen"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className={`${mobileStyles.iconButton} ${isCinema ? mobileStyles.iconActive : ""}`}
                                        onClick={() => setIsCinema((v) => !v)}
                                        aria-label={isCinema ? "Salir modo cine" : "Modo cine"}
                                    >
                                        ◱
                                    </button>
                                    <button
                                        type="button"
                                        className={mobileStyles.iconButton}
                                        onClick={toggleFullscreen}
                                        aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                                    >
                                        ⛶
                                    </button>
                                    <div className={mobileStyles.ccDropdown} data-cc-menu>
                                        <button
                                            type="button"
                                            className={`${mobileStyles.ccButton} ${selectedSubtitle !== "off" ? mobileStyles.ccActive : ""}`}
                                            onClick={() => {
                                                const next = !subtitleMenuOpen;
                                                setControlsVisible(true);
                                                if (hideTimerRef.current) {
                                                    clearTimeout(hideTimerRef.current);
                                                    hideTimerRef.current = null;
                                                }
                                                setSubtitleMenuOpen(next);
                                                if (!next && isPlaying) {
                                                    hideTimerRef.current = setTimeout(() => setControlsVisible(false), HIDE_DELAY_MS);
                                                }
                                            }}
                                            aria-label="Subtítulos"
                                        >
                                            CC
                                        </button>
                                        {subtitleMenuOpen && (
                                            <ul className={mobileStyles.ccMenu}>
                                                <li>
                                                    <button
                                                        type="button"
                                                        className={selectedSubtitle === "off" ? mobileStyles.ccSelected : ""}
                                                        onClick={() => {
                                                            setSelectedSubtitle("off");
                                                            setSubtitleMenuOpen(false);
                                                        }}
                                                    >
                                                        Desactivados
                                                    </button>
                                                </li>
                                                {currentSubtitles?.map((t) => (
                                                    <li key={t.lang}>
                                                        <button
                                                            type="button"
                                                            className={selectedSubtitle === t.lang ? mobileStyles.ccSelected : ""}
                                                            onClick={() => {
                                                                setSelectedSubtitle(t.lang);
                                                                setSubtitleMenuOpen(false);
                                                            }}
                                                        >
                                                            {t.label}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={mobileStyles.mobileCourseInfo}>
                    <p className={mobileStyles.mobileEyebrow}>Curso completo</p>
                    <h2>{course.title}</h2>
                    <span className={mobileStyles.mobileInstructor}>Equipo Combat Strike</span>
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
                            <div key={section.sectionTitle} className={mobileStyles.mobileSectionCard}>
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
                                            selectedSection === sectionIdx && selectedClass === classIdx;
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
                                                    <span className={mobileStyles.mobileClassIcon} aria-hidden="true">
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
                                {totalSections} secciones · {totalClasses} clases · {durationHours} h{" "}
                                {durationMinutes} min
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
        </section>
    );
}
