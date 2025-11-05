"use client";
import Image from "next/image";
import { useState } from "react";
import styles from "../css/Login.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";
import GuestGuard from "../utils/GuestGuard";
import { API_URL } from "../utils/api_url";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | null }>({
        message: "",
        type: null,
    });
    const [canResend, setCanResend] = useState(false);

    const { setAuthenticated } = useAuthContext();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAlert({ message: "", type: null });
        setCanResend(false);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                if (typeof data.message === "string") {
                    setAlert({ message: data.message, type: "error" });
                } else if (Array.isArray(data.message)) {
                    setAlert({ message: data.message.join(" | "), type: "error" });
                } else {
                    setAlert({ message: "Error al iniciar sesión.", type: "error" });
                }

                if (data.canResend) {
                    setCanResend(true);
                }
            } else {
                setAuthenticated(true);
                router.push("/");
            }
        } catch (err) {
            setAlert({ message: "Error de conexión.", type: "error" });
            console.error(err);
        }
    };

    // Función para reenviar verificación
    const handleResend = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setAlert({ message: "Se ha reenviado el correo de verificación.", type: "success" });
                setCanResend(false);
            } else {
                setAlert({ message: "Error al reenviar el correo.", type: "error" });
            }
        } catch (err) {
            setAlert({ message: "Error de conexión.", type: "error" });
        }
    };

    return (
        <GuestGuard>
            <div className={styles.container}>
                <div className={styles.backgroundLogo}>
                    <Image
                        src="/assets/logo-blanco-sin-texto.webp"
                        alt="Logo fondo"
                        width={1000}
                        height={1000}
                    />
                </div>

                <div className={styles.formBox}>
                    <div className={styles.logoWrapper}>
                        <Image
                            src="/assets/logo-blanco-sin-texto.webp"
                            alt="Logo"
                            width={100}
                            height={100}
                        />
                    </div>

                    {/* ALERTA con colores dinámicos */}
                    {alert.message && (
                        <div
                            className={`${styles.alertVisible} ${alert.type === "success" ? styles.alertGreen : styles.alertRed
                                }`}
                        >
                            {alert.message}
                        </div>
                    )}

                    {/* Botón para reenviar verificación */}
                    {canResend && (
                        <button onClick={handleResend} className={styles.resendButtonVerification}>
                            Reenviar correo de verificación
                        </button>
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

                        <p className={styles.forgotPassword}>
                            <Link href="/forgot-password">¿Has olvidado la contraseña?</Link>
                        </p>

                        <button type="submit" className={styles.button}>
                            Entrar
                        </button>
                    </form>

                    <p className={styles.registerText}>
                        ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
                    </p>
                </div>
            </div>
        </GuestGuard>
    );
}
