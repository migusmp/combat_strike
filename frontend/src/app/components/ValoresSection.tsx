import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../css/Home.module.css";

export default function ValoresSection() {
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
    <section className={styles.valoresSection} id="valores" ref={sectionRef}>
      <div className={styles.valoresGrid}>
        <div className={`${styles.valorBlock} ${visible ? styles.visible : ""}`}>
          <h4 className={styles.valorTitle}>Seguridad</h4>
          <p className={styles.valorText}>
            Nuestra prioridad es crear un entorno de aprendizaje seguro y práctico, donde cada alumno pueda entrenar con confianza, sabiendo que las técnicas que adquiere son útiles y aplicables a situaciones reales.
          </p>
        </div>
        <div className={`${styles.valorBlock} ${visible ? styles.visible : ""}`}>
          <h4 className={styles.valorTitle}>Disciplina</h4>
          <p className={styles.valorText}>
            La constancia, el respeto y el compromiso forman parte de nuestro método de enseñanza. La disciplina no solo perfecciona las técnicas, también moldea el carácter y fomenta la responsabilidad personal.
          </p>
        </div>
        <div className={`${styles.valorBlock} ${visible ? styles.visible : ""}`}>
          <h4 className={styles.valorTitle}>Confianza</h4>
          <p className={styles.valorText}>
            Buscamos que cada persona descubra su fortaleza interior. La autodefensa no solo protege el cuerpo, también fortalece la mente, transmitiendo la seguridad necesaria para desenvolverse en cualquier circunstancia.
          </p>
        </div>
        <div className={`${styles.valorBlock} ${visible ? styles.visible : ""}`}>
          <h4 className={styles.valorTitle}>Inclusión</h4>
          <p className={styles.valorText}>
            La defensa personal es un derecho universal. Adaptamos nuestra enseñanza para que todas las personas —sin importar edad, género o condición física— puedan aprender a defenderse y sentirse seguras.
          </p>
        </div>
        <div className={styles.valorImageBlock}>
          <Image
            src="/assets/valores-foto.JPEG"
            alt="Alumnos de Krav Maga"
            width={400}
            height={500}
            className={styles.valorImage}
          />
        </div>
      </div>
    </section>
  );
}