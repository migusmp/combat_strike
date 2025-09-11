"use client";
import Image from "next/image";
import styles from "./css/Home.module.css";
import Header from "./components/Header";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Header fijo */}
      <Header />

      {/* Sección 1: Hero / imagen de fondo */}
      <section className={styles.heroSection}>
        <div className={styles.heroImage}>
          <Image
            src="/assets/imagen_principal.jpg"
            alt="Fotografía de la naturaleza con montañas y cielo azul"
            fill
            priority
            className={styles.image}
          />
          <div className={styles.overlay}></div>
        </div>
      </section>

      {/* Sección 2: Contenido */}
      <section id="about" className={styles.section}>
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

      {/* Sección 3: Cursos */}
      <section className={styles.section}>
        <h2>Cursos</h2>
        <p>Detalles de tus cursos, imágenes y enlaces.</p>
      </section>

      {/* Sección 4: Contacto */}
      <section className={styles.section}>
        <h2>Contacto</h2>
        <p>Formulario o información de contacto aquí.</p>
      </section>
    </div>
  );
}
