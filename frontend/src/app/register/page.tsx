"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import styles from "../css/Login.module.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className={styles.container}>
      {/* Fondo con logo en transparencia */}
      <div className={styles.backgroundLogo}>
        <Image
          src="/assets/logo-blanco-sin-texto.png"
          alt="Logo fondo"
          width={1000}
          height={1000}
        />
      </div>

      {/* Formulario */}
      <div className={styles.formBox}>
        {/* Logo arriba */}
        <div className={styles.logoWrapper}>
          <Image
            src="/assets/logo-negro-sin-texto.png"
            alt="Logo"
            width={100}
            height={100}
          />
        </div>

        <h2 className={styles.title}>Crear Cuenta</h2>

        <form className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Nombre completo</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuemail@ejemplo.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          <button type="submit" className={styles.button}>
            Registrarse
          </button>
        </form>

        <p className={styles.registerText}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
