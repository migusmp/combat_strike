"use client"
import { useRef, useEffect, useState } from "react";
import styles from "../../css/Home.module.css";

export default function MissionVisionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.missionVisionDiagonalSection}>
      <div className={styles.missionVisionDiagonalContainer}>
        <div className={styles.missionDiagonalBlock}>
          <div className={styles.missionTitleRow}>
            <h2 className={`${styles.missionTitle} ${visible ? styles.visible : ""}`}>Misión</h2>
          </div>
          <p className={`${styles.missionText} ${visible ? styles.visible : ""}`}>
            Ser una marca de deporte de contacto capaz de dar la confianza y valentía que a uno mismo le falta para que cualquier persona sea capaz de defenderse de cualquier situación
          </p>
        </div>
        <div className={styles.visionDiagonalBlock}>
          <div className={styles.visionTitleRow}>
            <h2 className={`${styles.visionTitle} ${visible ? styles.visible : ""}`}>Visión</h2>
          </div>
          <p className={`${styles.visionText} ${visible ? styles.visible : ""}`}>
            Convertirnos en una marca líder dentro del mercado del deporte, creciendo exponencialmente con cursos innovadores, permitiéndonos ser reconocidos nacionalmente, con una comunidad leal
          </p>
        </div>
      </div>
    </section>
  );
}