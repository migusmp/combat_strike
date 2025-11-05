// app/contact/page.tsx (o ContactPage.tsx)
"use client";
import { useState } from "react";
import Footer from "../components/Home/Footer";
import Link from "next/link";
import Image from "next/image";
import styles from "../css/Contact.module.css";

export default function ContactPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        topic: "",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Formulario enviado:", form);
        alert("Formulario enviado correctamente!");
        setForm({ name: "", email: "", topic: "", message: "" });
    };

    return (
        <>
            <div className={styles.contactWrapper}>
                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <span className={styles.sectionEyebrow}>Hablemos</span>
                        <h1>¿Listo para entrenar o colaborar con nosotros?</h1>
                        <p>
                            Cuéntanos en qué podemos ayudarte. Nuestro equipo responde cada mensaje con la
                            atención personalizada que mereces.
                        </p>
                        <ul className={styles.heroHighlights}>
                            <li>Asesoría para cursos, talleres y formaciones in-company</li>
                            <li>Consultas sobre productos tácticos y equipamiento</li>
                            <li>Colaboraciones con marcas y eventos de defensa personal</li>
                        </ul>
                    </div>
                    <div className={styles.heroVisual}>
                        <div className={styles.heroVisualFrame}>
                            <Image
                                src="/assets/hero-contact.webp"
                                alt="Equipo de soporte Combat Strike"
                                fill
                                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 360px"
                                className={styles.heroImage}
                            />
                            <span className={styles.heroBadge}>Respuesta en menos de 24h</span>
                        </div>
                        <div className={styles.heroStats}>
                            <div>
                                <strong>+500</strong>
                                <span>Alumnos contactados</span>
                            </div>
                            <div>
                                <strong>4.9/5</strong>
                                <span>Satisfacción media</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.formSection}>
                    <div className={styles.formCard}>
                        <h2>Escríbenos</h2>
                        <p>Completa el formulario y nos pondremos en contacto lo antes posible.</p>
                        <form className={styles.contactForm} onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                <label className={styles.formField}>
                                    <span>Nombre y apellidos</span>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Ana López"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label className={styles.formField}>
                                    <span>Correo electrónico</span>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="ana@email.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label className={styles.formField}>
                                    <span>Interés principal</span>
                                    <input
                                        type="text"
                                        name="topic"
                                        placeholder="Curso, producto o colaboración"
                                        value={form.topic}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label className={`${styles.formField} ${styles.formFieldFull}`}>
                                    <span>Mensaje</span>
                                    <textarea
                                        name="message"
                                        placeholder="Cuéntanos en qué podemos ayudarte"
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                    />
                                </label>
                            </div>
                            <div className={styles.formActions}>
                                <button type="submit">Enviar mensaje</button>
                                <p className={styles.privacyNote}>
                                    Al enviar aceptas nuestra política de privacidad. Nunca compartiremos tus datos con
                                    terceros sin tu consentimiento.
                                </p>
                            </div>
                        </form>
                    </div>

                    <aside className={styles.contactInfo}>
                        <div className={styles.infoCard}>
                            <h3>Información directa</h3>
                            <div className={styles.infoGroup}>
                                <span>Email</span>
                                <a href="mailto:hola@combatstrike.es">hola@combatstrike.es</a>
                            </div>
                            <div className={styles.infoGroup}>
                                <span>Teléfono</span>
                                <a href="tel:+34600123456">+34 600 123 456</a>
                            </div>
                            <div className={styles.infoGroup}>
                                <span>Ubicación</span>
                                <p>Albacete · España</p>
                            </div>
                        </div>

                        <div className={styles.socialCard}>
                            <h3>Síguenos</h3>
                            <p>Descubre clases, consejos y eventos en nuestras redes.</p>
                            <div className={styles.socialGrid}>
                                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                    <span>Instagram</span>
                                </Link>
                                <Link href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
                                    <span>TikTok</span>
                                </Link>
                                <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                                    <span>YouTube</span>
                                </Link>
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
            <Footer />
        </>
    );
}
