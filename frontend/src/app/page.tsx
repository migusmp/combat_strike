"use client";
import Image from "next/image";
import styles from "./css/Home.module.css";
import Header from "./components/Header";

export default function Home() {

  return (
    <div className={styles.container}>
      {/* Imagen de fondo */}
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

      {/* Header */}
      <Header />

      {/* Contenido principal */}
      <div className={styles.heroContent}>
        <h2>Bienvenido a mi página</h2>
      </div>
    </div>
  );
}
