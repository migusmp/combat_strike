"use client";
import styles from "../../css/MobilePurchasedCourseContent.module.css";
import VideoHitbox from "../VideoHtiBox";
import TopButtons from "./TopButtons";
import { RefObject } from "react";
import { SubtitleTrack } from "@/app/interfaces/courses";
import OverlayControls, {
  OverlayControlsProps,
} from "./OverlayControlls/OverlayControlls";

type Props = {
  overlayActive: boolean;
  progressOnly: boolean;
  selectedSubtitle: "off" | string;
  currentSubtitles: SubtitleTrack[];
  baseUrl: string;
  courseId: string | number;

  /** 👇 NUEVO: clave para forzar remount del <video> */
  srcKey: string;

  // refs (tipos sin | null)
  videoRef: RefObject<HTMLVideoElement | null>;
  shellRef: RefObject<HTMLDivElement | null>;

  // handlers
  onTap: (e: any) => void;
  onToggleSettings: () => void;
  onQuickToggleCC: () => void;

  // overlay controls props
  overlayProps: OverlayControlsProps & {
    sectionSlug?: string;
    classSlug?: string;
  };

  // hint doble tap
  seekHint?: { side: "left" | "right"; id: number } | null;

  // end-screen props
  endCard?: {
    active: boolean;
    secondsLeft: number;
    progress?: number;
    nextTitle?: string;
    nextDuration?: string;
  } | null;
  onCancelAutoNext?: () => void;
  onPlayNextNow?: () => void;
};

export default function VideoPlayerShell({
  overlayActive,
  progressOnly,
  selectedSubtitle,
  currentSubtitles,
  baseUrl,
  courseId,
  srcKey,
  videoRef,
  shellRef,
  onTap,
  onToggleSettings,
  onQuickToggleCC,
  overlayProps,
  seekHint,
  endCard,
  onCancelAutoNext,
  onPlayNextNow,
}: Props) {
  return (
    <div ref={shellRef} className={styles.mobilePlayerShell}>
      <video
        ref={videoRef}
        className={`${styles.mobilePlayerVideo} ${
          endCard?.active ? styles.dimmedVideo : ""
        }`}
        playsInline
        preload="auto"
        controls={false}
        crossOrigin="use-credentials"
        onPointerDown={onTap}
        onClick={onTap}
        onTouchStart={onTap}
        /** Intento suave de autoplay solo una vez al montar/cargar */
        onLoadedMetadata={(e) => {
          const v = e.currentTarget as HTMLVideoElement;
          if (!v.dataset.autoplayTried) {
            v.dataset.autoplayTried = "1";
            if (v.paused) v.play().catch(() => {});
          }
        }}
        onCanPlay={(e) => {
          const v = e.currentTarget as HTMLVideoElement;
          if (!v.dataset.autoplayTried) {
            v.dataset.autoplayTried = "1";
            if (v.paused) v.play().catch(() => {});
          }
        }}
      >
        {overlayProps.sectionSlug &&
          overlayProps.classSlug &&
          currentSubtitles?.map((t, idx) => (
            <track
              key={`${t.file}-${idx}`}
              kind="subtitles"
              src={`${baseUrl}/courses/${courseId}/full/${overlayProps.sectionSlug}/${overlayProps.classSlug}/subtitles/${t.file}`}
              srcLang={t.lang}
              label={t.label}
            />
          ))}
      </video>

      <VideoHitbox isOverlayVisible={overlayActive} onTap={onTap} />

      <TopButtons
        ccActive={selectedSubtitle !== "off"}
        onQuickToggleCC={onQuickToggleCC}
        onOpenSettings={onToggleSettings}
        hidden={!overlayActive || progressOnly || !!endCard?.active}
      />

      {/* HINT de doble tap (+5s/-5s) */}
      <div
        className={`${styles.seekHint} ${
          seekHint
            ? seekHint.side === "left"
              ? styles.seekLeft
              : styles.seekRight
            : ""
        } ${seekHint ? styles.seekHintVisible : ""}`}
        key={seekHint?.id ?? 0}
        aria-hidden
      >
        <div className={styles.seekBubble}>
          {seekHint?.side === "right" ? "⏩ +5s" : "⏪ -5s"}
        </div>
      </div>

      {/* End screen minimal: anillo botón + título + close (X) */}
      {endCard?.active && (
        <div className={styles.endCardOverlay} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.endCardClose}
            aria-label="Cerrar"
            onClick={onCancelAutoNext}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
          </button>
          <div className={styles.endCardInline}>
            {(() => {
              const deg = Math.round((endCard.progress ?? 0) * 360);
              return (
                <button
                  type="button"
                  className={styles.endCardRingButton}
                  onClick={onPlayNextNow}
                  aria-label="Reproducir siguiente"
                >
                  <div className={styles.endCardRingWrap}>
                    <div className={styles.endCardRing}>
                      <div
                        className={styles.endCardRingProgress}
                        style={{
                          background: `conic-gradient(#ff004c ${deg}deg, rgba(255,255,255,0.15) ${deg}deg)`,
                        }}
                      />
                      <div className={styles.endCardRingInner}>
                        <span className={styles.endCardRingText}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="40"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })()}
            {endCard.nextTitle && (
              <>
                <p className={styles.endCardNextLabel}>Siguiente video</p>
                <h4 className={styles.endCardNextTitle}>{endCard.nextTitle}</h4>
              </>
            )}
          </div>
        </div>
      )}

      <OverlayControls
        {...overlayProps}
        overlayActive={overlayProps.overlayActive && !endCard?.active}
      />
    </div>
  );
}
