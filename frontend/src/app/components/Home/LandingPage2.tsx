"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "../../css/LandingPage2.module.css";
import Link from "next/link";
import CoursesSection from "./CoursesSection";
import CollaborationSection from "./CollaborationSection";

export default function LandingPage2() {
    const trainerRef = useRef<HTMLDivElement>(null);
    const assistantRef = useRef<HTMLDivElement>(null);

    const [trainerVisible, setTrainerVisible] = useState(false);
    const [assistantVisible, setAssistantVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (entry.target === trainerRef.current) {
                            setTrainerVisible(true);
                        } else if (entry.target === assistantRef.current) {
                            setAssistantVisible(true);
                        }
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (trainerRef.current) observer.observe(trainerRef.current);
        if (assistantRef.current) observer.observe(assistantRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <section className={styles.container}>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>COMBAT STRIKE</h1>
                    <p className={styles.description}>
                        DL Combat Strike es una marca de deportes de contacto enfocada en la
                        seguridad personal y basada en técnicas de krav maga israelí. Cuya
                        misión es permitir que las personas tengan la oportunidad de saber
                        defenderse y tener conocimientos básicos de defensa basada en
                        situaciones reales. La marca atrae a una comunidad única llena de
                        actitud de quienes buscan aprender y convertirse en luchadores.
                    </p>
                    <Link href="/login" className={styles.ctaBtn}>
                        Empieza aquí
                    </Link>
                </div>
                <div className={styles.imageContainer}>
                    <Image
                        src="/assets/logo-blanco-sin-texto.png"
                        width={600}
                        height={600}
                        alt="DL Combat Strike logo"
                        className={styles.image}
                    />
                </div>
            </section>

            {/* Trainer Section */}
            <section
                className={`${styles.trainerSection} ${trainerVisible ? styles.trainerSectionVisible : ""}`}
                ref={trainerRef}
            >
                <div className={styles.imageTrainerWrapper}>
                    <Image
                        src="/assets/valores-foto.JPEG"
                        width={400}
                        height={400}
                        alt="FOTO ENTRENADOR"
                        className={styles.imageTrainer}
                    />
                </div>
                <div className={styles.trainerText}>
                    <h2>NOMBRE DE COACH</h2>
                    <p>Recorrido y experiencia</p>
                    <p>
                        Lorem Ipsum es simplemente el texto de relleno de las imprentas...
                    </p>
                </div>
            </section>

            {/* Assistant Section */}
            <section
                className={`${styles.assistantSection} ${assistantVisible ? styles.assistantVisible : ""}`}
                ref={assistantRef}
            >
                <div className={styles.imageAssistantWrapper}>
                    <Image
                        src="/assets/valores-foto.JPEG"
                        width={400}
                        height={400}
                        alt="FOTO AYUDANTE"
                        className={styles.imageAssistant}
                    />
                </div>
                <div className={styles.assistantText}>
                    <h2>NOMBRE DE AYUDANTE</h2>
                    <p>Recorrido y experiencia</p>
                    <p>
                        Lorem Ipsum es simplemente el texto de relleno de las imprentas...
                    </p>
                </div>
            </section>
            <CoursesSection />
            <CollaborationSection />
        </>
    );
}

