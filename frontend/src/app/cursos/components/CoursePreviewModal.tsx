"use client";

import { useEffect } from "react";
import styles from "../css/CoursePreviewModal.module.css";

interface Video {
    title: string;
    duration: string;
}

interface CoursePreviewModalProps {
    show: boolean;
    onClose: () => void;
    courseTitle: string;
    videoSrc: string;
    videos: Video[];
}
export default function CoursePreviewModal({
    show,
    onClose,
    courseTitle,
    videoSrc,
    videos,
}: CoursePreviewModalProps) {
    useEffect(() => {
        if (show) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
    }, [show]);

    if (!show) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <p className={styles.previewLabel}>Vista previa del curso</p>
                    <button onClick={onClose} className={styles.closeBtn}>×</button>
                </div>

                {/* Video principal */}
                <div className={styles.videoWrapper}>
                    <video controls className={styles.videoPlayer}>
                        <source src={videoSrc} type="video/mp4" />
                        Tu navegador no soporta el elemento de video.
                    </video>
                    <h3 className={styles.courseTitle}>{courseTitle}</h3>
                </div>

                {/* Lista de videos */}
                <div className={styles.videoList}>
                    <p className={styles.listHeader}>Videos de ejemplo gratuitos:</p>
                    <ul>
                        {videos.map((v, i) => (
                            <li key={i}>
                                <div>
                                    <h4>{v.title}</h4>
                                    <span>{v.duration}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

