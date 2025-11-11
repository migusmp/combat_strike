"use client";
import styles from "../../css/MobilePurchasedCourseContent.module.css";

type Props = {
  progressRef: React.RefObject<HTMLDivElement | null>;
  currentTime: number;
  duration: number;
  onSeek: (e: any) => void;
  onProgressPointerDown: (e: React.PointerEvent) => void;
};

export default function ProgressBar({
  progressRef, currentTime, duration, onSeek, onProgressPointerDown,
}: Props) {
  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={progressRef as React.RefObject<HTMLDivElement>}
      className={styles.progress}
      onClick={onSeek}
      onPointerDown={onProgressPointerDown}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={Math.floor(duration)}
      aria-valuenow={Math.floor(currentTime)}
      aria-label="Progreso del video"
    >
      <div className={styles.progressTrack} />
      <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      <div className={styles.progressThumb} style={{ left: `${pct}%` }} />
      {/* El preview de tiempo se pinta desde Overlay si lo usas; aquí mantenemos estructura mínima */}
    </div>
  );
}