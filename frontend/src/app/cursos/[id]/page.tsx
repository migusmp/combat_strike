import { courses } from "@/lib/mockData";
import styles from '../css/Course.module.css'
import Footer from "@/app/components/Home/Footer";
import Image from "next/image";
import CourseContent from "../components/CourseContent";

interface CoursePageProps {
  params: { id: string };
}

export default function CoursePage({ params }: CoursePageProps) {
  const course = courses.find((c) => c.id === params.id);

  if (!course) return <h1>Curso no encontrado</h1>;

  return (
    <>
      <main className={styles.courseContainer}>
        <section className={styles.coursePresentation}>
          <div className={styles.courseHeader}>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <section>
              <p style={{ display: "flex", alignItems: "center", gap: "5px" }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-octagon" viewBox="0 0 16 16">
                <path d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1z" />
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
              </svg>Última actualización: {course.updated_at}</p>
              {course.isSubtitled && <p style={{ display: "flex", alignItems: "center", gap: "5px" }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-badge-cc" viewBox="0 0 16 16">
                <path d="M3.708 7.755c0-1.111.488-1.753 1.319-1.753.681 0 1.138.47 1.186 1.107H7.36V7c-.052-1.186-1.024-2-2.342-2C3.414 5 2.5 6.05 2.5 7.751v.747c0 1.7.905 2.73 2.518 2.73 1.314 0 2.285-.792 2.342-1.939v-.114H6.213c-.048.615-.496 1.05-1.186 1.05-.84 0-1.319-.62-1.319-1.727zm6.14 0c0-1.111.488-1.753 1.318-1.753.682 0 1.139.47 1.187 1.107H13.5V7c-.053-1.186-1.024-2-2.342-2C9.554 5 8.64 6.05 8.64 7.751v.747c0 1.7.905 2.73 2.518 2.73 1.314 0 2.285-.792 2.342-1.939v-.114h-1.147c-.048.615-.497 1.05-1.187 1.05-.839 0-1.318-.62-1.318-1.727z" />
                <path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
              </svg>Español [automático]</p>}
            </section>
          </div>
          <div className={styles.courseVideoIntroduction}>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                  </svg>
                </button>
                <p className={styles.previewText}>Vista previa del curso</p>
              </div>
            </div>
            {/* Contenido extra debajo, nunca moverá la imagen */}
            <div className={styles.courseExtraContent}>
              <p className={styles.coursePrice}>{course.price} €</p>
              {/* Puedes añadir más cosas aquí */}
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
            <button className={styles.shareCourseBtn}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-share-fill" viewBox="0 0 16 16">
                <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5" />
              </svg>
              Compartir
            </button>
          </div>
        </section>
        <section className={styles.whatYouWillLearnSection}>
          <h1>Lo que aprenderás</h1>
          <ul>
            {course.whatYouWillLearn.map((point, idx) => (
              <li key={idx}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2" viewBox="0 0 16 16">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
              </svg> {point}</li>
            ))}
          </ul>
        </section>

        <CourseContent courseId={params.id} />
      </main>
      <Footer />
    </>
  );
}
