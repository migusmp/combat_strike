"use client";
// 🔹 Indica a Next.js que este componente se ejecuta en el cliente (no en el servidor).

import { useEffect, useRef } from "react";
import Hls from "hls.js"; // 📦 Librería para reproducir videos HLS (.m3u8) en navegadores que no lo soportan nativamente.
import styles from "../css/CoursePreviewModal.module.css"; // 🎨 Importa los estilos del modal.
import { PreviewClip } from "../utils/previewClips";
import { API_URL } from "@/app/utils/api_url";
import { Course } from "@/app/interfaces/courses";

// 🔹 Interfaz de las propiedades que recibe el componente
interface CoursePreviewModalProps {
    show: boolean;        // Controla si el modal se muestra o no
    onClose: () => void;  // Función que se ejecuta al cerrar el modal
    courseTitle: string;  // Título del curso
    videoSrc: string;     // URL del video HLS (.m3u8)
    videos: PreviewClip[];      // Lista de videos gratuitos
    course: Course;
}


// 🧩 Componente principal
export default function CoursePreviewModal({
    show,
    onClose,
    courseTitle,
    videoSrc, // URL al .m3u8
    videos,
    course
}: CoursePreviewModalProps) {
    // 🎥 Crea una referencia al elemento <video> para manipularlo directamente.
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // ⚙️ useEffect: se ejecuta cada vez que cambia "show" o "videoSrc"
    useEffect(() => {
        let hls: Hls | null = null; // Variable para guardar la instancia de Hls

        if (show) {
            // 🔒 Bloquea el scroll de la página mientras el modal está abierto
            document.body.style.overflow = "hidden";

            // 🎬 Si el navegador soporta Hls.js (como Chrome, Firefox, Edge, etc.)
            if (videoRef.current && Hls.isSupported()) {
                hls = new Hls(); // Crea una nueva instancia del manejador HLS
                hls.loadSource(videoSrc); // Carga la fuente del video (.m3u8)
                hls.attachMedia(videoRef.current); // Conecta la instancia al <video>
            }
            // 🍏 Si el navegador es Safari (que soporta HLS de forma nativa)
            else if (
                videoRef.current &&
                videoRef.current.canPlayType("application/vnd.apple.mpegurl")
            ) {
                // Asigna directamente la URL al <video> para reproducción nativa
                videoRef.current.src = videoSrc;
            }
        }

        // 🧹 Cleanup: se ejecuta cuando el modal se cierra o cambia el video
        return () => {
            // 🔓 Restaura el scroll del cuerpo de la página
            document.body.style.overflow = "";

            // 🧽 Si había una instancia de HLS, destrúyela para liberar memoria
            try {
                if (hls) {
                    hls.destroy(); // Esto puede lanzar AbortError si había descargas activas
                }
            } catch (err: any) {
                // 🚫 Ignora AbortError (es normal si el usuario cierra el modal durante la carga)
                if (err.name !== "AbortError") {
                    console.warn("Error al destruir HLS:", err);
                }
            }
        };
    }, [show, videoSrc]);
    // 👆 Dependencias: se ejecuta cada vez que "show" o "videoSrc" cambian

    useEffect(() => {
        if (!show) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        containerRef.current?.focus();
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [show, onClose]);

    if (!show) {
        return null;
    }


    // 🧱 Renderizado del modal
    return (
        <div
            className={styles.modalOverlay}
            role="dialog"
            aria-modal="true"
            aria-label="Vista previa del curso"
            onClick={onClose}
        >
            <div
                className={styles.modalContent}
                onClick={(event) => event.stopPropagation()}
                tabIndex={-1}
                ref={containerRef}
            >
                <button onClick={onClose} className={styles.closeBtn} aria-label="Cerrar vista previa">
                    ×
                </button>

                <div className={styles.modalBody}>
                    <section className={styles.mediaSection}>
                        <p className={styles.previewLabel}>Vista previa del curso</p>
                        <div className={styles.videoWrapper}>
                            <video
                                controls
                                crossOrigin="anonymous"
                                ref={videoRef}
                                className={styles.videoPlayer}
                            >
                                {course?.previewSubtitles?.map((sub, i) => (
                                    <track
                                        key={i}
                                        kind="subtitles"
                                        src={`${API_URL}/courses/${course.id}/preview/subtitles/${sub.file}`}
                                        srcLang={sub.lang}
                                        label={sub.label}
                                        default={sub.lang === "es"}
                                    />
                                ))}
                            </video>
                        </div>
                        <div className={styles.mediaMeta}>
                            <h3>{courseTitle}</h3>
                            <p>Explora algunos clips antes de comenzar.</p>
                        </div>
                    </section>

                    <section className={styles.listSection} aria-label="Lista de clips de vista previa">
                        <p className={styles.listHeader}>Clips incluidos</p>
                        <ul>
                            {videos.map((clip, index) => (
                                <li key={`${clip.title}-${index}`}>
                                    <span className={styles.listIndex}>{index + 1}</span>
                                    <div className={styles.listCopy}>
                                        <p>{clip.title}</p>
                                        {clip.duration && <small>{clip.duration}</small>}
                                    </div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm1 0a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" />
                                    </svg>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
