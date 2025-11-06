"use client";
import { Course } from "@/app/interfaces/courses";
import styles from "../css/Course.module.css";

interface CourseHeaderProps {
  course: Course;
}

export default function CourseHeader({ course }: CourseHeaderProps) {
  const formattedDate = new Date(course.updated_at).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={styles.courseHeader}>
      <h1>{course.title}</h1>
      <p className={styles.courseSubtitle}>{course.description}</p>

      <div className={styles.courseRatingRow}>
        {course.reviews && course.reviews > 0 ? (
          <>
            <span className={styles.ratingStars}>
              {Array.from({ length: 5 }, (_, i) => {
                const starValue = i + 1;
                return (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill={
                      starValue <= Math.round(course.rating)
                        ? "#fdd835"
                        : "rgba(255,255,255,0.25)"
                    }
                  >
                    <path d="M3.612 15.443c-.396.198-.86-.106-.746-.592l.83-4.73-3.523-3.356c-.329-.314-.158-.888.283-.95l4.898-.696 2.186-4.327c.197-.39.73-.39.927 0l2.186 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.114.486-.35.79-.746.592L8 13.187l-4.389 2.256z" />
                  </svg>
                );
              })}
            </span>
            <span className={styles.ratingValue}>{course.rating.toFixed(1)}</span>
            <span className={styles.ratingCount}>
              ({course.reviews} valoraciones)
            </span>
          </>
        ) : (
          <span className={styles.ratingEmpty}>No hay valoraciones</span>
        )}
      </div>

      <div className={styles.courseMetaChips}>
        <span className={styles.metaChip}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1z" />
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
          </svg>
          Última actualización: <strong>{formattedDate}</strong>
        </span>

        <span className={styles.metaChip}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z" />
            <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z" />
          </svg>
          {course.language}
        </span>

        {course.isSubtitled && (
          <span className={styles.metaChip}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M3.708 7.755c0-1.111.488-1.753 1.319-1.753.681 0 1.138.47 1.186 1.107H7.36V7c-.052-1.186-1.024-2-2.342-2C3.414 5 2.5 6.05 2.5 7.751v.747c0 1.7.905 2.73 2.518 2.73 1.314 0 2.285-.792 2.342-1.939v-.114H6.213c-.048.615-.496 1.05-1.186 1.05-.84 0-1.319-.62-1.319-1.727zm6.14 0c0-1.111.488-1.753 1.318-1.753.682 0 1.139.47 1.187 1.107H13.5V7c-.053-1.186-1.024-2-2.342-2C9.554 5 8.64 6.05 8.64 7.751v.747c0 1.7.905 2.73 2.518 2.73 1.314 0 2.285-.792 2.342-1.939v-.114h-1.147c-.048.615-.497 1.05-1.187 1.05-.839 0-1.318-.62-1.318-1.727z" />
              <path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
            </svg>
            Español [automático]
          </span>
        )}
      </div>
    </div>
  );
}
