"use client";
import Image from "next/image";
import { useState } from "react";
import styles from "../css/AuthModern.module.css";
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

    const { setAuthenticated, refreshUser } = useAuthContext();
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
                try {
                    await refreshUser();
                } catch (error) {
                    console.warn("No se pudo cargar el perfil del usuario", error);
                }
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
            console.error(err);
        }
    };

    return (
        <GuestGuard>
            <div className={styles.page}>
                <div className={styles.card}>
                    <section className={styles.brandPanel}>
                        <span className={styles.badge}>Combat Strike</span>
                        <h1 className={styles.brandTitle}>Conecta con tu hub de entrenamiento</h1>
                        <p className={styles.brandCopy}>
                            Retoma tus cursos, desbloquea nuevos retos y lleva un registro claro de tu progreso en tiempo
                            real. Todo desde un panel que prioriza tu ritmo y motivación.
                        </p>
                        <ul className={styles.accentList}>
                            <li className={styles.accentItem}>
                                <span className={styles.accentIcon}>01</span>
                                Mentorías impartidas por instructores activos con experiencia de campo.
                            </li>
                            <li className={styles.accentItem}>
                                <span className={styles.accentIcon}>02</span>
                                Panel con métricas claras y certificados descargables en segundos.
                            </li>
                            <li className={styles.accentItem}>
                                <span className={styles.accentIcon}>03</span>
                                Comunidad privada para resolver dudas y compartir estrategias.
                            </li>
                        </ul>
                        <div className={styles.footNote}>
                            <span className={styles.pulse} aria-hidden="true" />
                            <p className={styles.footText}>
                                Más de 2.400 operadores han fortalecido sus habilidades desde nuestra plataforma.
                            </p>
                        </div>
                    </section>

                    <section className={styles.formPanel}>
                        <div className={styles.logoRow}>
                            <Image
                                src="/assets/logo-blanco-sin-texto.webp"
                                alt="Logo Combat Strike"
                                width={60}
                                height={60}
                                priority
                            />
                            <span>Inicia sesión para sincronizar tu progreso y desbloquear tus cursos activos.</span>
                        </div>

                        {alert.message && (
                            <div
                                className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : styles.alertError
                                    }`}
                            >
                                {alert.message}
                            </div>
                        )}

                        {canResend && (
                            <button type="button" onClick={handleResend} className={styles.resendButton}>
                                Reenviar correo de verificación
                            </button>
                        )}

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.fieldGroup}>
                                <label htmlFor="email" className={styles.label}>
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    className={styles.input}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tuemail@ejemplo.com"
                                    required
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label htmlFor="password" className={styles.label}>
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    className={styles.input}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className={styles.helperRow}>
                                <span>¿Olvidaste la clave?</span>
                                <Link href="/forgot-password" className={styles.link}>
                                    Recuperar acceso
                                </Link>
                            </div>

                            <button type="submit" className={styles.primaryButton}>
                                Entrar
                            </button>
                        </form>

                        <p className={styles.footLink}>
                            ¿No tienes cuenta?{" "}
                            <Link href="/register" className={styles.link}>
                                Regístrate ahora
                            </Link>
                        </p>
                    </section>
                </div>
            </div>
        </GuestGuard>
    );
}
