"use client";
import Image from "next/image";
import styles from "./css/Home.module.css";
import Header from "./components/Header";
import AboutSection from "./components/AboutSection";
import MissionVisionSection from "./components/MissionVisionSection";
import ValoresSection from "./components/ValoresSection";
import CursosSection from "./components/CursosSection";
import Footer from "./components/Footer";

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
      <AboutSection />

      {/* Sección 3: Misión y Visión del proyecto */}
      <MissionVisionSection />

      {/* Sección 4: Contacto */}
      <ValoresSection />

      <CursosSection />

      <Footer />
    </div>
  );
}
