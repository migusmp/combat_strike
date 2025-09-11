"use client";
import Image from "next/image";
import { useEffect, useState } from 'react';
import styles from '../css/Home.module.css'
import Link from "next/link";

export default function HeaderDesktop() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const handleResize = () => setIsMobile(window.innerWidth <= 616);
    window.addEventListener("resize", handleResize);

    // Ejecutar al cargar
    handleResize();
    setScrolled(window.scrollY > 20); // <-- Añade esto para inicializar el fondo según el scroll actual

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <header
    className={styles.header}
    style={{
      backgroundColor: scrolled ? "rgba(0,0,0,0.8)" : "transparent",
      backdropFilter: scrolled ? "blur(8px)" : "none",
    }}
  >
    {/* Menú centrado */}
    <nav className={styles.nav}>
      <Link href="/">Inicio</Link>
      <Link href="/cursos">Cursos</Link>
      <Link href="/shop">Tienda</Link>
      <Link href="/contact">Contáctanos</Link>
    </nav>

    {/* Botones a la derecha */}
    <div className={styles.buttons}>
      {isMobile ? (
        // Imagen que se muestra en móvil
        <Link href="/login">
          <button className={styles.buttonLoginMobile}>Login</button>
        </Link>
      ) : (
        // Botón que se muestra en desktop
        <Link href="/login">
          <button className={styles.buttonLogin}>Iniciar sesión</button>
        </Link>
      )}
      <Link href="/register">
        <button className={styles.buttonRegister}>Registrate</button>
      </Link>
    </div>
  </header>
}