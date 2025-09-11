import { useRef, useEffect, useState } from "react";
import styles from "../css/Home.module.css";

export default function AboutSection() {
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
    <section id="about" ref={sectionRef} className={styles.section}>
      <h2 className={`${styles.aboutTitle} ${visible ? styles.visible : ""}`}>
        ¿QUIÉNES SOMOS?
      </h2>
      <p className={`${styles.aboutText} ${visible ? styles.visible : ""}`}>
        DL Combat Strike es una marca de deportes de contacto enfocada en
        la seguridad personal y basada en técnicas de krav maga israelí. 
        Cuya misión es permitir que las personas tengan la oportunidad de 
        saber defenderse y tener conocimientos básicos de defensa basada en 
        situaciones reales. La marca atrae a una comunidad única llena de 
        actitud de quienes buscan aprender y convertirse en luchadores.
      </p>
    </section>
  );
}