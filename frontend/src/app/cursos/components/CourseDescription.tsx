"use client";
import { useState } from "react";
import styles from "../css/Course.module.css";
import stylesLarge from '../css/CourseLarger.module.css'

interface CourseDescriptionProps {
    text: string;
    isReducedScreen?: boolean;
    maxLength?: number; // opcional, por defecto 250
}

export default function CourseDescription({ text, maxLength = 250, isReducedScreen }: CourseDescriptionProps) {
    const [showFullDesc, setShowFullDesc] = useState(false);

    const shouldTruncate = text.length > maxLength;
    const displayedText = showFullDesc ? text : text.slice(0, maxLength) + (shouldTruncate ? "..." : "");

    const styleUsed = isReducedScreen ? stylesLarge : styles;

    return (
        <section className={styleUsed.courseDescription}>
            <h2>Descripción</h2>
            <p>{displayedText}</p>

            {shouldTruncate && (
                <button
                    className={styleUsed.toggleDescriptionBtn}
                    onClick={() => setShowFullDesc(!showFullDesc)}
                >
                    {showFullDesc ? (
                        <>
                            Ver menos{" "}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-chevron-up"
                                viewBox="0 0 16 16"
                            >
                                <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z" />
                            </svg>
                        </>
                    ) : (
                        <>
                            Ver más{" "}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-chevron-down"
                                viewBox="0 0 16 16"
                            >
                                <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                            </svg>
                        </>
                    )}
                </button>
            )}
        </section>
    );
}

