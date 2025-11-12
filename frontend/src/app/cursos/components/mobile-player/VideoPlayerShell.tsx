"use client";
import styles from "../../css/MobilePurchasedCourseContent.module.css";
import VideoHitbox from "../VideoHtiBox";
import TopButtons from "./TopButtons";
import { RefObject } from "react";
import { SubtitleTrack } from "@/app/interfaces/courses";
import OverlayControls, { OverlayControlsProps } from "./OverlayControlls/OverlayControlls";

type Props = {
  overlayActive: boolean;
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
};

export default function VideoPlayerShell({
  overlayActive,
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
}: Props) {
  return (
    <div ref={shellRef} className={styles.mobilePlayerShell}>
      <video
        ref={videoRef}
        className={styles.mobilePlayerVideo}
        playsInline
        preload="auto"
        controls={false}
        crossOrigin="use-credentials"
        onPointerDown={onTap}
        onClick={onTap}
        onTouchStart={onTap}
        /** Un par de reintentos “suaves” por si el autoplay se bloquea */
        onLoadedMetadata={(e) => {
          const v = e.currentTarget as HTMLVideoElement;
          v.play().catch(() => {/* esperar interacción */});
        }}
        onCanPlay={(e) => {
          const v = e.currentTarget as HTMLVideoElement;
          if (v.paused) v.play().catch(() => {/* esperar interacción */});
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
              /** activa el que tengas seleccionado si quieres: */
              default={selectedSubtitle !== "off" && selectedSubtitle === t.lang}
            />
          ))}
      </video>

      <VideoHitbox isOverlayVisible={overlayActive} onTap={onTap} />
          
      <TopButtons
        ccActive={selectedSubtitle !== "off"}
        onQuickToggleCC={onQuickToggleCC}
        onOpenSettings={onToggleSettings}
        hidden={!overlayActive}
      />

      {/* HINT de doble tap (+5s/-5s) */}
      <div
        className={`${styles.seekHint} ${
          seekHint ? (seekHint.side === "left" ? styles.seekLeft : styles.seekRight) : ""
        } ${seekHint ? styles.seekHintVisible : ""}`}
        key={seekHint?.id ?? 0}
        aria-hidden
      >
        <div className={styles.seekBubble}>
          {seekHint?.side === "right" ? "⏩ +5s" : "⏪ -5s"}
        </div>
      </div>

      <OverlayControls {...overlayProps} />
    </div>
  );
}
