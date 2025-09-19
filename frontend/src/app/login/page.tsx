"use client";
import Image from "next/image";
import { useState } from "react";
import styles from "../css/Login.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";
import GuestGuard from "../utils/GuestGuard";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState("");

  const { setAuthenticated } = useAuthContext();

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert("");

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // para manejar cookies HttpOnly
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message === "Debes verificar tu correo antes de iniciar sesión...") {
          setAlert(data.message);
        } else if (Array.isArray(data.message)) {
          setAlert(data.message.join(" | "));
        } else {
          setAlert(data.message || "Error al iniciar sesión.");
        }
      } else {
        // Aquí puedes guardar el token, redirigir, etc.
        // Por ejemplo: router.push("/dashboard");
        setAuthenticated(true);
        router.push("/");
      }
    } catch (err) {
      setAlert("Error de conexión.");
      console.error(err);
    }
  };

  return (
    <GuestGuard>
      <div className={styles.container}>
        <div className={styles.backgroundLogo}>
          <Image
            src="/assets/logo-blanco-sin-texto.png"
            alt="Logo fondo"
            width={1000}
            height={1000}
          />
        </div>

        <div className={styles.formBox}>
          <div className={styles.logoWrapper}>
            <Image
              src="/assets/logo-negro-sin-texto.png"
              alt="Logo"
              width={100}
              height={100}
            />
          </div>

          {/* ALERTA ROJA CON EFECTO */}
          {alert === "Debes verificar tu correo antes de iniciar sesión..." && (
            <div className={styles.alertRed + " " + styles.alertVisible}>
              {alert}
            </div>
          )}
          {/* Otros errores */}
          {alert && alert !== "Debes verificar tu correo antes de iniciar sesión..." && (
            <div className={styles.alertRed + " " + styles.alertVisible}>
              {alert}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
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
            {/* Enlace para recuperar contraseña */}
            <p className={styles.forgotPassword}>
              <Link href="/forgot-password">¿Has olvidado la contraseña?</Link>
            </p>

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
    </GuestGuard>
  );
}
