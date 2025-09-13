"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "../css/Login.module.css";
import Link from "next/link";
import GuestGuard from "../utils/GuestGuard";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert("");
    setSuccess("");

    if (!token) {
      setAlert("Token inválido");
      return;
    }

    if (password !== confirmPassword) {
      setAlert("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert(data.message || "Error al restablecer la contraseña");
      } else {
        setSuccess("Contraseña restablecida correctamente");
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch (err) {
      setAlert("Error de conexión");
    }
  };

  return (
    <GuestGuard>
      <div className={styles.container}>
      <div className={styles.formBox}>
        <h2 style={{ color: "#055293", fontWeight: "bold", fontSize: "1.5rem"}}>Restablecer contraseña</h2>

        {alert && <div className={styles.alertRed + " " + styles.alertVisible}>{alert}</div>}
        {success && <div className={styles.alertGreen + " " + styles.alertVisible}>{success}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.button}>
            Restablecer contraseña
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
