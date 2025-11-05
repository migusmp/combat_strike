"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "../../css/LandingPage2.module.css";
import CollaborationSection from "./CollaborationSection";
import Footer from "./Footer";
import useCourses from "@/app/hooks/useCourses";
import Link from "next/link";

export default function LandingPage2() {
    const trainerRef = useRef<HTMLDivElement>(null);
    const assistantRef = useRef<HTMLDivElement>(null);
    const [showTrainerMore, setShowTrainerMore] = useState(false);
    const [showAssistantMore, setShowAssistantMore] = useState(false);

    const [trainerVisible, setTrainerVisible] = useState(false);
    const [assistantVisible, setAssistantVisible] = useState(false);
    const { courses, isLoading, error } = useCourses();
    const featuredCourses = (courses ?? []).slice(0, 3);

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
                <div className={`${styles.trainerText} ${showTrainerMore ? styles.expanded : ""}`}>
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
                    <button
                        className={styles.showMoreBtn}
                        onClick={() => setShowTrainerMore(prev => !prev)}
                    >
                        {showTrainerMore ? "Ver menos" : "Ver más"}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            viewBox="0 0 16 16">
                            <path fillRule="evenodd"
                                d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </button>
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
                <div className={`${styles.assistantText} ${showAssistantMore ? styles.expanded : ""}`}>
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
                    <button
                        className={styles.showMoreBtn}
                        onClick={() => setShowAssistantMore(prev => !prev)}
                    >
                        {showAssistantMore ? "Ver menos" : "Ver más"}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            viewBox="0 0 16 16">
                            <path fillRule="evenodd"
                                d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </button>
                </div>
            </section>
            <section className={styles.featuredCourses}>
                <div className={styles.featuredInner}>
                    <div className={styles.featuredHeader}>
                        <span className={styles.sectionEyebrow}>Selección Combat Strike</span>
                        <h2>Algunos de nuestros cursos</h2>
                        <p>
                            Entrena con las experiencias que más recomendamos a quienes se inician o buscan dar
                            el siguiente paso en defensa personal.
                        </p>
                    </div>

                    {isLoading && <p className={styles.featuredStatus}>Cargando cursos...</p>}
                    {error && !isLoading && (
                        <p className={styles.featuredStatus}>Error al cargar cursos: {error}</p>
                    )}
                    {!isLoading && !error && featuredCourses.length === 0 && (
                        <p className={styles.featuredStatus}>No hay cursos disponibles en este momento.</p>
                    )}
                    {!isLoading && !error && featuredCourses.length > 0 && (
                        <div className={styles.featuredGrid}>
                            {featuredCourses.map((course, idx) => (
                                <Link
                                    key={course.id}
                                    href={`/cursos/${course.id}`}
                                    className={styles.featuredCard}
                                >
                                    <div className={styles.featuredImageWrapper}>
                                        <Image
                                            src={course.image}
                                            alt={course.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 360px"
                                            className={styles.featuredImage}
                                            priority={idx < 2}
                                        />
                                        <span className={styles.featuredCategory}>{course.category}</span>
                                    </div>
                                    <div className={styles.featuredContent}>
                                        <h3 className={styles.featuredCourseTitle}>{course.title}</h3>
                                        <p className={styles.featuredDescription}>{course.description}</p>
                                        <div className={styles.featuredFooter}>
                                            <span className={styles.featuredPrice}>{course.price} €</span>
                                            <span className={styles.featuredLink}>Ver curso</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    <div className={styles.featuredActions}>
                        <Link href="/cursos" className={styles.primaryBtn}>
                            Ir a todos los cursos
                        </Link>
                        <Link href="/register" className={styles.secondaryBtn}>
                            Empieza a entrenar
                        </Link>
                    </div>
                </div>
            </section>
            <CollaborationSection />
            <Footer />
        </>
    );
}
