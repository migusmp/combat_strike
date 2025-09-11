"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "../css/Home.module.css";

export default function HeaderMobile() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Inicializa el fondo según el scroll actual al cargar
    setScrolled(window.scrollY > 20);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={styles.header}
      style={{
        backgroundColor: scrolled ? "rgba(0,0,0,0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        position: "fixed",
        width: "100%",
        zIndex: 50,
      }}
    >
      {/* Imagen a la izquierda */}
      <div>
        <Image
          src="/assets/usuario-sin-logo.png"
          alt="Logo"
          width={160}
          height={40}
          className={styles.loginIconMobile}
        />
      </div>

      {/* Icono hamburguesa a la derecha */}
      <div
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ cursor: "pointer", zIndex: 60 }}
      >
        <div
          style={{
            width: "30px",
            height: "3px",
            backgroundColor: "white",
            margin: "6px 0",
            transition: "0.4s",
            transform: menuOpen ? "rotate(-45deg) translate(-5px, 6px)" : "none",
          }}
        />
        <div
          style={{
            width: "30px",
            height: "3px",
            backgroundColor: "white",
            margin: "6px 0",
            opacity: menuOpen ? 0 : 1,
            transition: "0.4s",
          }}
        />
        <div
          style={{
            width: "30px",
            height: "3px",
            backgroundColor: "white",
            margin: "6px 0",
            transition: "0.4s",
            transform: menuOpen ? "rotate(45deg) translate(-5px, -6px)" : "none",
          }}
        />
      </div>

      {/* Menu desplegable */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "50%",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.95)",
            display: "flex",
            flexDirection: "column",
            padding: "60px 20px",
            transition: "0.3s",
          }}
        >
          <a href="#home" style={{ color: "white", margin: "20px 0", fontSize: "20px" }}>Inicio</a>
          <a href="#cursos" style={{ color: "white", margin: "20px 0", fontSize: "20px" }}>Cursos</a>
          <a href="#tienda" style={{ color: "white", margin: "20px 0", fontSize: "20px" }}>Tienda</a>
          <a href="#contact" style={{ color: "white", margin: "20px 0", fontSize: "20px" }}>Contáctanos</a>
        </div>
      )}
    </header>
  );
}
