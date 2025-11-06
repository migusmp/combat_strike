import stylesLarge from "../css/CourseLarger.module.css";
import styles from "../css/Course.module.css";
import Image from "next/image";
import Footer from "@/app/components/Home/Footer";
import ShareModal from "./ShareModal";
import { useMemo, useState } from "react";
import CourseRequirements from "./CourseRequirements";
import CourseDescription from "./CourseDescription";
import CourseReviews from "./CourseReviews";
import CoursePreviewModal from "./CoursePreviewModal";
import { Course } from "@/app/interfaces/courses";
import { buildPreviewClips } from "../utils/previewClips";

interface DesktopCourseLayoutProps {
  course: Course;
  showShare: boolean;
  setShowShare: (val: boolean) => void;
  setShowPreviewModal: (val: boolean) => void;
  showPreviewModal: boolean;
}

export default function LargeScreenCourseLayout({
  course,
  setShowShare,
  showShare,
  setShowPreviewModal,
  showPreviewModal,
}: DesktopCourseLayoutProps) {
  const [openSections, setOpenSections] = useState<boolean[]>(
    Array(course.content.length || 0).fill(false)
  );

  const formattedDate = new Date(course.updated_at).toLocaleDateString(
    "es-ES",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  const handleClose = () => setShowPreviewModal(false);
  const previewClips = useMemo(() => {
    const clips = buildPreviewClips(course);
    return clips.length
      ? clips
      : [{ title: "Vista previa del curso", duration: "" }];
  }, [course]);
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const videoSrc = `${baseUrl}/courses/${course.id}/preview/playlist`;

  const totalSections = course.content.length;
  const totalClasses = course.content.reduce(
    (sum, section) => sum + section.classes.length,
    0
  );
  const totalDuration = course.content.reduce(
    (acc, section) => {
      section.classes.forEach((cls) => {
        acc.hours += cls.duration.hours;
        acc.minutes += cls.duration.minutes;
      });
      return acc;
    },
    { hours: 0, minutes: 0 }
  );

  totalDuration.hours += Math.floor(totalDuration.minutes / 60);
  totalDuration.minutes = totalDuration.minutes % 60;

  const toggleSection = (index: number) => {
    setOpenSections((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const toggleAllSections = () => {
    const allOpen = openSections.every(Boolean);
    setOpenSections(Array(totalSections).fill(!allOpen));
  };

  const hasReviews = Boolean(course.reviews && course.reviews > 0);

  return (
    <>
      <main className={stylesLarge.container}>
        <section className={stylesLarge.sectionMain}>
          <section className={stylesLarge.heroSection}>
            <div className={stylesLarge.heroGlow} />
            <div className={stylesLarge.heroContent}>
              <p className={stylesLarge.heroEyebrow}>Entrena con propósito</p>
              <h1 className={stylesLarge.courseTitle}>{course.title}</h1>
              <p className={stylesLarge.heroSubtitle}>{course.description}</p>

              <div className={stylesLarge.heroChips}>
                <span className={stylesLarge.heroChip}>
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
                  {formattedDate}
                </span>
                <span className={stylesLarge.heroChip}>
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
                  <span className={stylesLarge.heroChip}>
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

              <div className={stylesLarge.heroRating}>
                {hasReviews ? (
                  <>
                    <div className={stylesLarge.starsRow}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 16 16"
                          fill={
                            i + 1 <= Math.round(course.rating)
                              ? "#fdd835"
                              : "rgba(255,255,255,0.3)"
                          }
                        >
                          <path d="M3.612 15.443c-.396.198-.86-.106-.746-.592l.83-4.73-3.523-3.356c-.329-.314-.158-.888.283-.95l4.898-.696 2.186-4.327c.197-.39.73-.39.927 0l2.186 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.114.486-.35.79-.746.592L8 13.187l-4.389 2.256z" />
                        </svg>
                      ))}
                    </div>
                    <span>
                      {course.rating.toFixed(1)} ({course.reviews} valoraciones)
                    </span>
                  </>
                ) : (
                  <span>No hay valoraciones</span>
                )}
              </div>
            </div>

            <div className={stylesLarge.videoCard}>
              <div className={styles.imageWrapper}>
                <Image
                  src={course.image}
                  alt={course.title}
                  width={390}
                  height={220}
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

              <div className={stylesLarge.videoDetails}>
                <p className={stylesLarge.videoPrice}>{course.price} €</p>
                <p className={stylesLarge.videoAccess}>
                  Acceso de por vida al contenido
                </p>
                <button className={stylesLarge.primaryCTA}>
                  Comprar ahora
                </button>
                <button
                  className={stylesLarge.secondaryCTA}
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
            </div>
          </section>

          <section className={stylesLarge.sectionStack}>
            <section className={stylesLarge.whatYouWillLearnSection}>
              <h1>Lo que aprenderás</h1>
              <ul>
                {course.whatYouWillLearn.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </section>

            <section className={stylesLarge.courseIncludes}>
              <h1>Este curso incluye</h1>
              <ul>
                {(course.includes ?? []).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section className={stylesLarge.courseContentSection}>
              <div className={stylesLarge.courseContentHeader}>
                <div>
                  <p className={stylesLarge.contentEyebrow}>
                    Plan de entrenamiento
                  </p>
                  <h2>Contenido del curso</h2>
                </div>
                <div className={stylesLarge.courseContentSummary}>
                  <p className={stylesLarge.courseContentMeta}>
                    {totalSections} secciones · {totalClasses} clases ·{" "}
                    {totalDuration.hours} h {totalDuration.minutes} min totales
                  </p>
                  <button
                    className={stylesLarge.expandAllButton}
                    onClick={toggleAllSections}
                  >
                    {openSections.every(Boolean)
                      ? "Contraer todas"
                      : "Ampliar todas"}
                  </button>
                </div>
              </div>

              {course.content.map((section, idx) => (
                <div key={idx} className={stylesLarge.courseSection}>
                  <button
                    className={stylesLarge.sectionHeader}
                    onClick={() => toggleSection(idx)}
                  >
                    {section.sectionTitle}
                    <span className={stylesLarge.chevron}>
                      {openSections[idx] ? "▲" : "▼"}
                    </span>
                  </button>
                  <div
                    className={`${stylesLarge.sectionClasses} ${
                      openSections[idx] ? stylesLarge.sectionClassesOpen : ""
                    }`}
                  >
                    <ul>
                      {section.classes.map((cls, cidx) => (
                        <li key={cidx}>
                          <span className={styles.className}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-play-btn"
                              viewBox="0 0 16 16"
                            >
                              <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
                            </svg>
                            {cls.title}
                          </span>
                          <span className={stylesLarge.classDuration}>
                            {cls.duration.hours > 0
                              ? `${cls.duration.hours} h `
                              : ""}
                            {cls.duration.minutes} min
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </section>

            <CourseRequirements
              requirements={course.requirements}
              isReducedScreen={true}
            />
            <CourseDescription
              text={course.longDescription}
              maxLength={250}
              isReducedScreen={true}
            />
            <CourseReviews
              userReviews={course.userReviews}
              isReducedScreen={true}
            />
          </section>
        </section>
      </main>

      {showShare && (
        <ShareModal
          url={`${process.env.NEXT_PUBLIC_URL}/cursos/${course.id}`}
          onClose={() => setShowShare(false)}
        />
      )}

      <div className={stylesLarge.fixedBottomBar}>
        <div className={stylesLarge.leftSide}>
          <h2 className={stylesLarge.courseName}>{course.title}</h2>
          {hasReviews && (
            <div className={stylesLarge.courseRating}>
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill={
                    i + 1 <= Math.round(course.rating)
                      ? "#fdd835"
                      : "rgba(255,255,255,0.3)"
                  }
                >
                  <path d="M3.612 15.443c-.396.198-.86-.106-.746-.592l.83-4.73-3.523-3.356c-.329-.314-.158-.888.283-.95l4.898-.696 2.186-4.327c.197-.39.73-.39.927 0l2.186 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.114.486-.35.79-.746.592L8 13.187l-4.389 2.256z" />
                </svg>
              ))}
              <span>
                {course.rating.toFixed(1)} ({course.reviews} valoraciones)
              </span>
            </div>
          )}
        </div>

        <div className={stylesLarge.rightSide}>
          <p className={stylesLarge.bottomBarPrice}>{course.price} €</p>
          <button className={stylesLarge.bottomBarCTA}>Comprar ahora</button>
        </div>
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

      <Footer />
    </>
  );
}
