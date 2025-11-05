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

    if (!show) {
        return null;
    }


    // 🧱 Renderizado del modal
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>

                {/* 🏷️ Header del modal con el título y el botón de cierre */}
                <div className={styles.modalHeader}>
                    <p className={styles.previewLabel}>Vista previa del curso</p>
                    <button onClick={onClose} className={styles.closeBtn}>×</button>
                </div>

                {/* 🎥 Contenedor principal del video */}
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
                                default={sub.lang === "es"} // Español por defecto
                            />
                        ))}
                    </video>
                </div>

                {/* 📌 Título principal del curso */}
                <h3 className={styles.courseTitle}>{courseTitle}</h3>


                {/* 🎞️ Lista de videos gratuitos que se muestran debajo */}
                <div className={styles.videoList}>
                    <p className={styles.listHeader}>Videos de ejemplo gratuitos:</p>
                    <ul>
                        {videos.map((v, i) => (
                            <li key={i}>
                                <div>
                                    <h4>{v.title}</h4>      {/* Título del video */}
                                    <span>{v.duration}</span> {/* Duración */}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
