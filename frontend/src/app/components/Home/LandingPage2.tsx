"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "../../css/LandingPage2.module.css";
import Link from "next/link";
import CoursesSection from "./CoursesSection";
import CollaborationSection from "./CollaborationSection";
import Footer from "./Footer";

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
                        seguridad personal y basada en técnicas de krav maga. Cuya
                        misión es permitir que las personas tengan la oportunidad de saber
                        defenderse y tener conocimientos básicos de defensa basada en
                        situaciones reales. La marca atrae a una comunidad única llena de
                        actitud de quienes buscan aprender y convertirse en luchadores.
                    </p>
                    <div className={styles.btnContainer}>
                        <Link href="/register" className={styles.btnUnirse}>Únete ahora</Link>
                        <Link href="/cursos" className={styles.btnExplorarCursos}>Explorar Cursos</Link>
                    </div>
                    <Link href="/login" className={styles.ctaBtn}>
                        Empieza aquí
                    </Link>
                </div>
                <div className={styles.imageContainer}>
                    <Image
                        src="/assets/logo-blanco-sin-texto.webp"
                        width={600}
                        height={600}
                        alt="DL Combat Strike logo"
                        className={styles.image}
                        priority={true}
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
                    <h2>DAMIÁN GUTIÉRREZ ROLDÁN</h2>
                    <p>Soy <strong>Instructor Nacional en Defensa Personal Femenina (Nivel 1)</strong> desde el año 2018.
                        A lo largo de mi trayectoria profesional he dedicado mi trabajo a la formación en
                        seguridad personal y técnicas de autoprotección, colaborando en diferentes ámbitos
                        tanto civiles como institucionales.
                        He tenido el privilegio de impartir formación especializada a la Policía Local de
                        Albacete, avalado por el <strong>certificado en Defensa Personal Policial (Nivel 2)</strong>. Además,
                        soy <strong>cinturón negro 2º Dan</strong> y poseo el <strong>certificado de Director de Seguridad</strong> expedido
                        por la Universidad de Ávila, lo que refuerza mi perfil técnico y mi compromiso con la
                        enseñanza responsable de la defensa personal.
                        Desde el año 2019, desarrollo mi labor como instructor de boxeo y Krav Maga
                        impartiendo clases tanto a adultos como a jóvenes. Mi objetivo como profesional
                        es promover la formación integral en defensa personal, fomentando valores como
                        la disciplina, la seguridad y el autocontrol, pilares fundamentales para el desarrollo
                        físico y mental de cada alumno.</p>
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
                    <h2>LLANOS MARTÍNEZ TORRES</h2>
                    <p>
                        Desde el año 2021 colaboro como <strong>ayudante de Damián, desempeñando
                            funciones de apoyo tanto en la enseñanza como en la preparación técnica. </strong>
                        Comencé a practicar boxeo y Krav Maga a los 14 años, disciplinas que
                        con el tiempo se han convertido en una auténtica pasión y en parte
                        esencial de mi desarrollo personal y profesional.
                        Actualmente, me encuentro <strong>federada como cinturón negro de Krav
                            Maga</strong> y continúo ampliando mis conocimientos y competencias. Mi
                        próximo objetivo es obtener la certificación oficial como instructora
                        de defensa personal femenina, con el propósito de transmitir a otras
                        mujeres las herramientas necesarias para fortalecer su seguridad, confianza y autonomía.
                    </p>
                </div>
            </section>
            <CoursesSection />
            <CollaborationSection />
            <Footer />
        </>
    );
}

