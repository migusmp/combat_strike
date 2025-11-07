"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import useCourses from "@/app/hooks/useCourses";
import styles from "./Gracias.module.css";

export default function GraciasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("curso");
  const courseId = courseParam ? Number(courseParam) : null;

  const { courses, isLoading, error } = useCourses();

  const course = useMemo(() => {
    if (!courseId || !courses) return null;
    return courses.find((item) => item.id === courseId) ?? null;
  }, [courseId, courses]);

  const goToCourse = () => {
    if (courseId) router.push(`/cursos/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <header className={styles.header}>
          <span className={styles.icon}>✔</span>
          <div>
            <h1>¡Pago confirmado!</h1>
            <p className={styles.subtitle}>
              Te hemos enviado un correo con todos los detalles. Ya puedes acceder al contenido y
              comenzar tu entrenamiento.
            </p>
          </div>
        </header>

        {error && <p className={styles.muted}>No pudimos cargar el curso: {error}</p>}

        <div className={styles.infoGrid}>
          <div className={styles.infoBox}>
            <p className={styles.label}>Curso</p>
            <p className={styles.value}>{course?.title ?? "Compra confirmada"}</p>
            {course && (
              <ul className={styles.list}>
                <li>• Idioma: {course.language}</li>
                <li>• Acceso vitalicio</li>
              </ul>
            )}
          </div>
          <div className={styles.infoBox}>
            <p className={styles.label}>Importe</p>
            <p className={styles.value}>
              {course?.price ? `${course.price} €` : "Será visible en tu recibo"}
            </p>
            <ul className={styles.list}>
              <li>• Pago seguro con PayPal</li>
              <li>• IVA incluido</li>
            </ul>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={goToCourse}
            disabled={!courseId}
          >
            Ir al curso
          </button>
          <Link href="/mis-cursos" className={styles.secondary}>
            Ver mis cursos
          </Link>
          <Link href="/cursos" className={styles.secondary}>
            Seguir explorando
          </Link>
        </div>

        <p className={styles.muted}>
          ¿Necesitas ayuda? Escríbenos respondiendo al correo de confirmación o desde la sección de
          contacto.
        </p>
      </section>
    </main>
  );
}
