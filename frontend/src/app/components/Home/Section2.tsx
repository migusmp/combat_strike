import { useRef, useEffect, useState } from "react";
import styles from "../../css/Home.module.css";

export default function Section2() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target); // Observa solo una vez
        }
      },
      { threshold: 0.2 } // 20% visible para disparar animación
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${visible ? styles.fadeIn : ""}`}
    >
      <h2>¿QUIÉNES SOMOS?</h2>
      <p>
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
