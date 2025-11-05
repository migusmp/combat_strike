"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Footer from "../components/Home/Footer";
import styles from "../css/Productos.module.css";
import CombatStrikeProductCard from "./components/CombatStrikeProductCard";

export interface Product {
    title: string;
    image: string;
    name: string;
    topics: string[];
    ageWarning?: string;
    href: string;
}

export default function ZuluTacticalPage() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, []);

    const products: Product[] = [
        {
            title: "Spray de Defensa Personal",
            image: "/assets/spray-pimienta-2.webp",
            topics: ["Alcance efectivo: 3 m", "Accionador ergonómico", "Homologado en la UE"],
            name: "Spray clásico",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Gas Pimienta",
            image: "/assets/spray-pimienta-1.webp",
            topics: ["Alcance: 4 m", "Chorro concentrado anti-viento", "Fabricación española"],
            name: "Serie profesional",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray Compacto",
            image: "/assets/spray-pimienta-2.png",
            topics: ["Formato de bolsillo", "Seguro anti-activación", "Homologado en la UE"],
            name: "Edición urbana",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray Profesional",
            image: "/assets/spray-pimienta-1.png",
            topics: ["Potencia profesional", "Boquilla recambiable", "Formulación certificada"],
            name: "Uso táctico",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
    ];

    return (
        <>
            <div className={styles.container}>
                <section className={styles.hero}>
                    <div className={styles.heroInner}>
                        <div className={styles.heroContent}>
                            <span className={styles.partnerBadge}>Colaboración Oficial</span>
                            <h1 className={styles.heroTitle}>
                                Defensa personal premium con{" "}
                                <span className={styles.heroHighlight}>Zulu Tactical</span>
                            </h1>
                            <p className={styles.heroLead}>
                                Equipamos a nuestra comunidad con tecnología táctica diseñada en España para
                                responder con seguridad, rapidez y confianza.
                            </p>
                            <ul className={styles.heroFeatures}>
                                <li>Sprays certificados y listos para uso civil y profesional</li>
                                <li>Calidad auditada junto a instructores Combat Strike</li>
                                <li>Entrega rápida y soporte directo de Zulu Tactical</li>
                            </ul>
                            <div className={styles.heroCtas}>
                                <a href="#productos" className={styles.primaryBtn}>
                                    Ver selección
                                </a>
                                <a
                                    href="https://zulutactical.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.secondaryBtn}
                                >
                                    Visitar tienda Zulu Tactical
                                </a>
                            </div>
                        </div>
                        <div className={styles.heroVisual}>
                            <div className={styles.heroVisualFrame}>
                                <Image
                                    src="/assets/spray-pimienta-1.webp"
                                    alt="Spray profesional Zulu Tactical"
                                    fill
                                    sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 420px"
                                    className={styles.heroImage}
                                />
                                <div className={styles.heroBadge}>
                                    <span>Protección inmediata</span>
                                </div>
                            </div>
                            <div className={styles.heroStats}>
                                <div>
                                    <strong>+10</strong>
                                    <span>años de experiencia</span>
                                </div>
                                <div>
                                    <strong>100%</strong>
                                    <span>producción nacional</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.aboutSection}>
                    <div className={styles.aboutInner}>
                        <div className={styles.aboutCopy}>
                            <h2>¿Por qué confiamos en Zulu Tactical?</h2>
                            <p>
                                Zulu Tactical lidera el mercado nacional de equipamiento táctico con productos
                                desarrollados de la mano de cuerpos de seguridad, instructores y profesionales
                                de defensa personal. Cada spray se somete a pruebas de calidad rigurosas que
                                garantizan fiabilidad en situaciones reales.
                            </p>
                            <div className={styles.aboutHighlights}>
                                <article>
                                    <span className={styles.highlightTitle}>Certificación UE</span>
                                    <p>Formulaciones y envases homologados conforme a la normativa vigente.</p>
                                </article>
                                <article>
                                    <span className={styles.highlightTitle}>Diseño táctico</span>
                                    <p>Activación intuitiva, ergonomía optimizada y bloqueos anti-accidentales.</p>
                                </article>
                                <article>
                                    <span className={styles.highlightTitle}>Compromiso Combat Strike</span>
                                    <p>
                                        Seleccionamos los productos que recomendamos en nuestras formaciones y
                                        cursos oficiales.
                                    </p>
                                </article>
                            </div>
                        </div>
                        <div className={styles.aboutVisual}>
                            <Image
                                src="/assets/zulu-team.webp"
                                alt="Equipo especializado de Zulu Tactical"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 520px"
                                className={styles.aboutImage}
                            />
                        </div>
                    </div>
                </section>

                <section id="productos" className={styles.productsSection}>
                    <div className={styles.productsHeader}>
                        <span className={styles.sectionEyebrow}>Selección Combat Strike</span>
                        <h2>Sprays recomendados junto a Zulu Tactical</h2>
                        <p>
                            Una muestra curada de soluciones listas para acompañarte en tus entrenamientos y en
                            tu día a día. Cada pieza ha sido probada en nuestros programas y cumple con los
                            estándares de seguridad que exigimos.
                        </p>
                    </div>
                    <div className={styles.productsGrid}>
                        {products.map((product, index) => (
                            <CombatStrikeProductCard key={index} product={product} loaded={loaded} index={index} />
                        ))}
                    </div>
                </section>

                <section className={styles.ctaSection}>
                    <div className={styles.ctaInner}>
                        <div>
                            <span className={styles.sectionEyebrow}>Siguiente paso</span>
                            <h2>Equípate con confianza y formación</h2>
                            <p>
                                Complementa tu entrenamiento con material táctico avalado por nuestros
                                instructores. Zulu Tactical y Combat Strike te acompañan desde el aula hasta la
                                calle.
                            </p>
                        </div>
                        <div className={styles.ctaActions}>
                            <a href="/cursos" className={styles.secondaryBtn}>
                                Ver cursos de defensa
                            </a>
                            <a
                                href="https://zulutactical.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.primaryBtn}
                            >
                                Ver catálogo Zulu Tactical
                            </a>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
