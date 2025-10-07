"use client";

import Image from "next/image";
import styles from "../css/Course.module.css";

interface CourseVideoIntroductionProps {
    course: {
        image: string;
        title: string;
        price: number | string;
        includes: string[];
    };
    isSticky: boolean;
    setShowShare: (show: boolean) => void;
}

export default function CourseVideoIntroduction({
    course,
    isSticky,
    setShowShare,
}: CourseVideoIntroductionProps) {
    return (
        <div
            className={`${styles.courseVideoIntroduction} ${isSticky ? styles.stickyVideo : ""
                }`}
        >
            <div className={styles.imageWrapper}>
                <Image
                    src={course.image}
                    alt={course.title}
                    width={300}
                    height={200}
                    className={styles.courseImage}
                />
                <div className={styles.overlay}>
                    <button className={styles.startButton}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-play-circle-fill"
                            viewBox="0 0 16 16"
                        >
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                        </svg>
                    </button>
                    <p className={styles.previewText}>Vista previa del curso</p>
                </div>
            </div>

            {/* Contenido extra debajo */}
            <div className={styles.courseExtraContent}>
                <p className={styles.coursePrice}>{course.price} €</p>
                <button className={styles.buyCourseButton}>Comprar ahora</button>
            </div>

            <section className={styles.courseIncludes}>
                <h3>Este curso incluye:</h3>
                <ul>
                    {course.includes.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
            </section>

            <button
                className={styles.shareCourseBtn}
                onClick={() => setShowShare(true)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-share-fill"
                    viewBox="0 0 16 16"
                >
                    <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5" />
                </svg>
                Compartir
            </button>
        </div>
    );
}

