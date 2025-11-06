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
    const heroStats = [
        // { value: "4.8", suffix: "/5", label: "Valoración media" },
        { value: "+6", suffix: "", label: "Cursos disponibles" },
        { value: "24/7", suffix: "", label: "Acceso a prácticas" },
    ];

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
            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>Prepárate para reaccionar <br /> antes de la primera amenaza</h1>
                        <p className={styles.heroDescription}>
                            DL Combat Strike es una marca de deportes de contacto enfocada en la seguridad personal y basada en
                            técnicas de Krav Maga. Nuestra misión es enseñarte a responder ante situaciones reales, dotándote de
                            reflejos, estrategia y carácter para convertirte en tu primera línea de defensa.
                        </p>
                        <div className={styles.heroActions}>
                            <Link href="/register" className={styles.heroPrimaryCTA}>Empieza hoy</Link>
                            <Link href="/cursos" className={styles.heroSecondaryCTA}>Explorar cursos</Link>
                        </div>
                        <div className={styles.heroStats}>
                            {heroStats.map(stat => (
                                <div key={stat.label} className={styles.heroStatCard}>
                                    <strong>
                                        {stat.value}
                                        <span>{stat.suffix}</span>
                                    </strong>
                                    <span>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.heroVisual}>
                        <div className={styles.heroBadge}>Formación 2025</div>
                        <Image
                            src="/assets/imagen_principal.jpg"
                            alt="Entrenamiento táctico Combat Strike"
                            fill
                            priority
                            className={styles.heroImage}
                        />
                        <div className={styles.heroOverlayCard}>
                            <span>Ruta destacada</span>
                            <h3>Pack Defensa Personal</h3>
                            <p>Incluye cursos presenciales y online para dominar respuestas tácticas desde el primer mes.</p>
                            <Link href="/cursos">Ver cursos →</Link>
                        </div>
                    </div>
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
            <section className={styles.presencialSection}>
                <div className={styles.presencialInner}>
                    <div className={styles.presencialHeader}>
                        <span className={styles.sectionEyebrow}>Entrenamiento presencial</span>
                        <h2>Vive Combat Strike en directo</h2>
                        <p>
                            Sesiones reducidas con nuestros coaches para llevar la técnica a otro nivel.
                            Grupos selectos, material incluido y feedback personalizado.
                        </p>
                    </div>
                    <div className={styles.presencialGrid}>
                        <article className={styles.presencialCard}>
                            <div className={styles.presencialMedia}>
                                <Image
                                    src="/assets/imagen-presencial.jpg"
                                    alt="Taller intensivo Krav Maga"
                                    fill
                                    className={styles.presencialImage}
                                />
                                <span className={styles.presencialBadge}>Albacete · Martes</span>
                            </div>
                            <div className={styles.presencialBody}>
                                <h3>Krav Maga · Defensa Urbana Intensiva</h3>
                                <p>
                                    Entrenamiento de 4 horas centrado en escenarios urbanos, control corporal
                                    y respuesta ante agarres.
                                </p>
                                <ul>
                                    <li>Máximo 14 plazas</li>
                                    <li>Incluye material y water break</li>
                                    <li>Certificado Combat Strike</li>
                                </ul>
                                <footer>
                                    <span>Próxima fecha: 12 Abril</span>
                                    <Link href="/contact">Reservar plaza</Link>
                                </footer>
                            </div>
                        </article>
                        <article className={styles.presencialCard}>
                            <div className={styles.presencialMedia}>
                                <Image
                                    src="/assets/imagen-presencial-spray.jpg"
                                    alt="Clínica uso de sprays"
                                    fill
                                    className={styles.presencialImage}
                                />
                                <span className={styles.presencialBadge}>Albacete · Jueves</span>
                            </div>
                            <div className={styles.presencialBody}>
                                <h3>Uso profesional de sprays</h3>
                                <p>
                                    Manejo seguro, distancias reales y protocolos de desescalada con simulacros controlados.
                                </p>
                                <ul>
                                    <li>2 h 30 min de práctica guiada</li>
                                    <li>Sprays inertes incluidos</li>
                                    <li>Enfoque mixto: defensa femenina y urbana</li>
                                </ul>
                                <footer>
                                    <span>Próxima fecha: 21 Abril</span>
                                    <Link href="/contacto">Solicitar info</Link>
                                </footer>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
            <CollaborationSection />
            <Footer />
        </>
    );
}
