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

            <section
                className={`${styles.teamSection} ${trainerVisible ? styles.teamVisible : ""}`}
                ref={trainerRef}
            >
                <div className={`${styles.teamCard} ${styles.trainerCard}`}>
                    <div className={styles.teamVisual}>
                        <Image
                            src="/assets/valores-foto.JPEG"
                            alt="Damián Gutiérrez Roldán"
                            fill
                            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 40vw, 320px"
                            className={styles.teamImage}
                        />
                        <span className={styles.teamBadge}>Head Coach</span>
                    </div>
                    <div className={`${styles.teamContent} ${showTrainerMore ? styles.contentExpanded : ""}`}>
                        <span className={styles.sectionEyebrow}>Instructor principal</span>
                        <h2>Damián Gutiérrez Roldán</h2>
                        <p>
                            Instructor nacional en defensa personal femenina nivel 1, cinturón negro 2º Dan y director de
                            seguridad certificado. Desde 2019 lidera las formaciones de boxeo y Krav Maga de Combat
                            Strike, integrando protocolos policiales, prevención y valores de autocontrol.
                        </p>
                        {showTrainerMore && (
                            <ul className={styles.teamHighlights}>
                                <li>Formador para cuerpos de seguridad locales y entidades privadas</li>
                                <li>Especializado en defensa personal aplicada a escenarios reales</li>
                                <li>Diseña programas adaptados a adolescentes, adultos y colectivos vulnerables</li>
                            </ul>
                        )}
                        <button
                            className={styles.teamToggle}
                            onClick={() => setShowTrainerMore(prev => !prev)}
                            type="button"
                        >
                            {showTrainerMore ? "Ver menos" : "Ver perfil completo"}
                        </button>
                    </div>
                </div>
            </section>

            <section
                className={`${styles.teamSection} ${assistantVisible ? styles.teamVisible : ""} ${styles.assistantLayout}`}
                ref={assistantRef}
            >
                <div className={`${styles.teamCard} ${styles.assistantCard}`}>
                    <div className={styles.teamVisual}>
                        <Image
                            src="/assets/valores-foto.JPEG"
                            alt="Llanos Martínez Torres"
                            fill
                            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 40vw, 320px"
                            className={styles.teamImage}
                        />
                        <span className={styles.teamBadge}>Assistant Coach</span>
                    </div>
                    <div className={`${styles.teamContent} ${showAssistantMore ? styles.contentExpanded : ""}`}>
                        <span className={styles.sectionEyebrow}>Coach asistente</span>
                        <h2>Llanos Martínez Torres</h2>
                        <p>
                            Boxeadora y cinturón negro de Krav Maga, federada y apasionada por la enseñanza. Desde 2021
                            acompaña cada entrenamiento aportando técnica, cercanía y una visión estratégica orientada a
                            mujeres y jóvenes.
                        </p>
                        {showAssistantMore && (
                            <ul className={styles.teamHighlights}>
                                <li>Especialista en acompañamiento y preparación técnica en defensa femenina</li>
                                <li>Referente para nuevas alumnas: empatía, disciplina y actitud de superación</li>
                                <li>En proceso de certificación como instructora oficial de defensa personal femenina</li>
                            </ul>
                        )}
                        <button
                            className={styles.teamToggle}
                            onClick={() => setShowAssistantMore(prev => !prev)}
                            type="button"
                        >
                            {showAssistantMore ? "Ver menos" : "Ver perfil completo"}
                        </button>
                    </div>
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
