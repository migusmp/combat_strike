"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import styles from "../css/Login.module.css";
import GuestGuard from "../utils/GuestGuard";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nombre,
          second_name: apellidos,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (Array.isArray(data.message)) {
          setError(data.message.join(" | "));
        } else {
          setError(data.message || "Error al registrar.");
        }
      } else {
        // Limpiar campos
        setNombre("");
        setApellidos("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        // Mostrar mensaje de éxito
        setSuccessMessage(
          "¡Registro exitoso! Revisa tu correo para verificar tu cuenta."
        );
      }
    } catch (err) {
      setError("Error de conexión.");
      console.error(err);
    }
  };

  return (
    <GuestGuard>
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
              width={60}
              height={60}
            />
          </div>

          <h2 className={styles.title}>Crear Cuenta</h2>

          {/* Cartel de éxito */}
          {successMessage && (
            <div
              style={{
                backgroundColor: "#42cd38ff",
                color: "#072a06ff",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {successMessage}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="apellidos">Apellidos</label>
              <input
                id="apellidos"
                type="text"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Apellidos"
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

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button}>
              Registrarse
            </button>
          </form>

          <p className={styles.registerText}>
            ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </GuestGuard>
  );
}
