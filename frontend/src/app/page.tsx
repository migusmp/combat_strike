"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./css/Home.module.css";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <header
        className={styles.header}
        style={{
          backgroundColor: scrolled ? 'rgba(0,0,0,0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
        }}
      >
        {/* Menú centrado */}
        <nav className={styles.nav}>
          <a href="#home">Inicio</a>
          <a href="#tienda">Tienda</a>
          <a href="#contact">Contáctanos</a>
        </nav>

        {/* Botones a la derecha */}
        <div className={styles.buttons}>
          <button className={styles.buttonLogin}>Iniciar sesión</button>
          <button className={styles.buttonRegister}>Registrate</button>
        </div>
      </header>

      {/* Contenido principal */}
      <div className={styles.heroContent}>
        <h2>Bienvenido a mi página</h2>
      </div>
    </div>
  );
}
