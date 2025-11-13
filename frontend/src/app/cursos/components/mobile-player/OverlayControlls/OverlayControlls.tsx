"use client";
import styles from "../../../css/MobilePurchasedCourseContent.module.css";
import ProgressBar from "../ProgressBar";

export type OverlayControlsProps = {
  overlayActive: boolean;
  progressOnly?: boolean;
  isPlaying: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  currentTime: number;
  duration: number;

  progressRef: React.RefObject<HTMLDivElement | null>;

  onTap: (e: any) => void;
  onSeek: (e: any) => void;
  onProgressPointerDown: (e: React.PointerEvent) => void;
  togglePlay: () => void;
  goPrev: () => void;
  goNext: () => void;

  isFullscreen: boolean;
  toggleFullscreen: () => void;
  formatTimeLabel: (t: number) => string;

  sectionSlug?: string;
  classSlug?: string;
};

export default function OverlayControls(props: OverlayControlsProps) {
  const {
    overlayActive, progressOnly: progressOnlyProp, isPlaying, hasPrev, hasNext,
    currentTime, duration,
    progressRef,
    onTap, onSeek, onProgressPointerDown,
    togglePlay, goPrev, goNext,
    isFullscreen, toggleFullscreen,
    formatTimeLabel,
  } = props;
  const progressOnly = !!progressOnlyProp;

  return (
    <div className={`${styles.overlay} ${overlayActive ? styles.overlayVisible : ""}`}>
      {/* Fondo que recoge taps cuando es visible */}
      <div
        className={styles.overlayBackdrop}
        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onTap(e); }}
        aria-hidden
      />

      {/* Centro: prev/play/next */}
      {!progressOnly && (
        <div
          className={styles.overlayCenter}
          onPointerDown={(e) => {
            const el = e.target as HTMLElement;
            if (el.closest("button")) e.stopPropagation();
          }}
        >
          <button
            type="button"
            className={`${styles.navButton} ${styles.navLeft}`}
            disabled={!hasPrev || !overlayActive}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goPrev(); }}
            aria-label="Clase anterior"
          >
            {/* bi-skip-start-fill */}
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 4a.5.5 0 0 1 1 0v3.248l6.267-3.636c.54-.313 1.232.066 1.232.696v7.384c0 .63-.692 1.01-1.232.697L5 8.753V12a.5.5 0 0 1-1 0z" />
            </svg>
          </button>

          <button
            type="button"
            className={styles.centerPlay}
            onClick={togglePlay}
            disabled={!overlayActive}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              // bi-pause-fill
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5" />
              </svg>
            ) : (
              // bi-play-fill
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className={`${styles.navButton} ${styles.navRight}`}
            disabled={!hasNext || !overlayActive}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goNext(); }}
            aria-label="Siguiente clase"
          >
            {/* bi-skip-end-fill */}
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.693 3.3 4 3.678 4 4.308v7.384c0 .63.692 1.01 1.233.697L11.5 8.753V12a.5.5 0 0 0 1 0z" />
            </svg>
          </button>
        </div>
      )}

      {/* Inferior: barra + meta + fullscreen */}
      <div
        className={styles.bottomControls}
        onPointerDown={(e) => {
          const el = e.target as HTMLElement;
          if (el.closest('button, input, [role="slider"]')) e.stopPropagation();
        }}
      >
        <ProgressBar
          progressRef={progressRef}
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
          onProgressPointerDown={onProgressPointerDown}
        />

        <div className={styles.bottomMeta}>
          <span>{formatTimeLabel(currentTime)} / {formatTimeLabel(duration)}</span>
          {!progressOnly && (
            <div className={styles.bottomRight}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? (
                  // bi-fullscreen-exit
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z" />
                  </svg>
                ) : (
                  // bi-fullscreen
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
