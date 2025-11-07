"use client";

import { useMemo } from "react";
import Image from "next/image";
import CoursePreviewModal from "./CoursePreviewModal";
import styles from "../css/Course.module.css";
import { Course } from "@/app/interfaces/courses";
import { buildPreviewClips } from "../utils/previewClips";
import Link from "next/link";

interface CourseVideoIntroductionProps {
  course: Course;
  isSticky: boolean;
  setShowShare: (show: boolean) => void;
  setShowPreviewModal: (val: boolean) => void;
  showPreviewModal: boolean;
}

export default function CourseVideoIntroduction({
  course,
  isSticky,
  setShowShare,
  showPreviewModal,
  setShowPreviewModal,
}: CourseVideoIntroductionProps) {
  const handleClose = () => setShowPreviewModal(false);
  const previewClips = useMemo(() => {
    const clips = buildPreviewClips(course);
    return clips.length
      ? clips
      : [{ title: "Vista previa del curso", duration: "" }];
  }, [course]);
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const videoSrc = `${baseUrl}/courses/${course.id}/preview/playlist`;

  return (
    <>
      <div
        className={`${styles.courseVideoIntroduction} ${
          isSticky ? styles.stickyVideo : ""
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
            <button
              className={styles.startButton}
              onClick={() => setShowPreviewModal(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
              </svg>
            </button>
            <p className={styles.previewText}>Vista previa del curso</p>
          </div>
        </div>

        <div className={styles.courseExtraContent}>
          <p className={styles.coursePrice}>{course.price} €</p>
          <p className={styles.courseAccessNote}>
            Acceso de por vida al contenido
          </p>
          <Link
            href={`/cursos/${course.id}/checkout`}
            className={styles.buyCourseButton}
          >
            Comprar ahora
          </Link>
        </div>

        <section className={styles.courseIncludes}>
          <h3>Este curso incluye:</h3>
          <ul>
            {course.includes?.map((item: string, idx: number) => (
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
            viewBox="0 0 16 16"
          >
            <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5" />
          </svg>
          Compartir
        </button>
      </div>

      {showPreviewModal && (
        <CoursePreviewModal
          show={true}
          onClose={handleClose}
          courseTitle={course.title}
          videoSrc={videoSrc}
          videos={previewClips}
          course={course}
        />
      )}
    </>
  );
}
