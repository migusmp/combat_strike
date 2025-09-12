"use client";
import Image from "next/image";
import { useState } from "react";
import styles from "../css/Login.module.css";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className={styles.container}>
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

        {/* <h2 className={styles.title}>Iniciar Sesión</h2> */}

        <form className={styles.form}>
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

          <button type="submit" className={styles.button}>
            Entrar
          </button>
        </form>

        <p className={styles.registerText}>
          ¿No tienes cuenta?{" "}
          <Link href="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
