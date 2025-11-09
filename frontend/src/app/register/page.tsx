"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import styles from "../css/AuthModern.module.css";
import GuestGuard from "../utils/GuestGuard";
import { API_URL } from "../utils/api_url";

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
            const res = await fetch(`${API_URL}/auth/register`, {
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
            <div className={styles.page}>
                <div className={styles.card}>
                    <section className={styles.brandPanel}>
                        <span className={styles.badge}>Nueva generación</span>
                        <h1 className={styles.brandTitle}>Impulsa tu siguiente nivel formativo</h1>
                        <p className={styles.brandCopy}>
                            Accede a rutas formativas, talleres en vivo y certificaciones enfocadas en tu crecimiento
                            profesional dentro y fuera del campo.
                        </p>
                        <ul className={styles.accentList}>
                            <li className={styles.accentItem}>
                                <span className={styles.accentIcon}>A</span>
                                Planes personalizados para roles de liderazgo, soporte médico y operación.
                            </li>
                            <li className={styles.accentItem}>
                                <span className={styles.accentIcon}>B</span>
                                Feedback continuo de instructores con experiencia internacional.
                            </li>
                            <li className={styles.accentItem}>
                                <span className={styles.accentIcon}>C</span>
                                Certificados digitales listos para compartir en minutos.
                            </li>
                        </ul>
                        <div className={styles.footNote}>
                            <span className={styles.pulse} aria-hidden="true" />
                            <p className={styles.footText}>Únete a la comunidad Combat Strike y mantén tu progreso siempre vigente.</p>
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
                            <span>Completa tu registro y desbloquea el acceso inmediato a tus cursos.</span>
                        </div>

                        {successMessage && (
                            <div className={`${styles.alert} ${styles.alertSuccess}`}>{successMessage}</div>
                        )}

                        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.dualFields}>
                                <div className={styles.fieldGroup}>
                                    <label htmlFor="nombre" className={styles.label}>
                                        Nombre
                                    </label>
                                    <input
                                        id="nombre"
                                        className={styles.input}
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Juan"
                                        required
                                    />
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label htmlFor="apellidos" className={styles.label}>
                                        Apellidos
                                    </label>
                                    <input
                                        id="apellidos"
                                        className={styles.input}
                                        type="text"
                                        value={apellidos}
                                        onChange={(e) => setApellidos(e.target.value)}
                                        placeholder="Pérez"
                                        required
                                    />
                                </div>
                            </div>

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

                            <div className={styles.dualFields}>
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

                                <div className={styles.fieldGroup}>
                                    <label htmlFor="confirmPassword" className={styles.label}>
                                        Confirmar contraseña
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        className={styles.input}
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <p className={styles.terms}>
                                Al crear tu cuenta aceptas recibir comunicaciones importantes del entrenamiento. Podrás
                                darte de baja cuando quieras.
                            </p>

                            <button type="submit" className={styles.primaryButton}>
                                Crear cuenta
                            </button>
                        </form>

                        <p className={styles.footLink}>
                            ¿Ya tienes cuenta?{" "}
                            <Link href="/login" className={styles.link}>
                                Inicia sesión
                            </Link>
                        </p>
                    </section>
                </div>
            </div>
        </GuestGuard>
    );
}
