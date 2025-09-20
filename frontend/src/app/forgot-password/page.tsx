"use client";

import { useState } from "react";
import styles from "../css/Login.module.css"; // puedes reutilizar estilos
import Link from "next/link";
import GuestGuard from "../utils/GuestGuard";
import { API_URL } from "../utils/api_url";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert(data.message || "Error al enviar el correo.");
      } else {
        setSuccess("Se ha enviado un correo para restablecer tu contraseña.");
      }
    } catch (err) {
      setAlert("Error de conexión.");
      console.error(err);
    }
  };

  return (
    <GuestGuard>
      <div className={styles.container}>
        <div className={styles.formBox}>
          <h2 style={{ color: "#055293", fontWeight: "bold", fontSize: "1.5rem" }}>Recuperar contraseña</h2>

          {/* ALERTAS */}
          {alert && <div className={styles.alertRed + " " + styles.alertVisible}>{alert}</div>}
          {success && <div className={styles.alertGreen + " " + styles.alertVisible}>{success}</div>}

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

            <button type="submit" className={styles.button}>
              Enviar correo
            </button>
          </form>

          <p className={styles.registerText}>
            <Link href="/login">Volver al login</Link>
          </p>
        </div>
      </div>
    </GuestGuard>
  );
}
