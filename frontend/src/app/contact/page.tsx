// app/contact/page.tsx (o ContactPage.tsx)
"use client";
import { useState } from "react";
import styles from "../css/Contact.module.css";
import Footer from "../components/Home/Footer";

export default function ContactPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Formulario enviado:", form);
        alert("Formulario enviado correctamente!");
        setForm({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <>
            <div className={styles.contactContainer}>
                <h1>Contacto</h1>
                <p>Si tienes alguna duda o comentario, completa el formulario y te responderemos pronto.</p>
                <form className={styles.contactForm} onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Nombre"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Correo electrónico"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="subject"
                        placeholder="Asunto"
                        value={form.subject}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="message"
                        placeholder="Mensaje"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={6}
                    />
                    <button type="submit">Enviar</button>
                </form>
            </div>
            <Footer />
        </>
    );
}

