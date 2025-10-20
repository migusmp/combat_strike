"use client";
import { useEffect, useState } from "react";
import Footer from "../components/Home/Footer";
import styles from "../css/Productos.module.css";
import Image from "next/image";
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
            topics: ["Alcance: 3 metros", "Fácil de usar", "Cumple con legislación vigente"],
            name: "Spray de defensa",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Gas Pimienta",
            image: "/assets/spray-pimienta-1.webp",
            topics: ["Alcance: 4 metros", "Resistente al viento", "Cumple con legislación vigente"],
            name: "Spray de defensa",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray Compacto",
            image: "/assets/spray-pimienta-2.png",
            topics: ["Diseño ergonómico", "Tamaño de bolsillo", "Cumple con legislación vigente"],
            name: "Spray de defensa",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray Profesional",
            image: "/assets/spray-pimienta-1.png",
            topics: ["Alcance: 4 metros", "Uso profesional", "Cumple con legislación vigente"],
            name: "Spray de defensa",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
    ];

    return (
        <>
            <div className={styles.container}>
                {/* 🌟 HERO */}
                <section className={styles.hero}>
                    <div className={styles.heroLeft}>
                        <Image
                            src="/assets/zulu-tactical.webp"
                            alt="Zulu Tactical Logo"
                            width={250}
                            height={250}
                            className={styles.heroLogo}
                        />
                        <h1>
                            Defensa personal de élite con <span>Zulu Tactical</span>
                        </h1>
                        <h3 className={styles.subtitle}>Innovación, fiabilidad y rendimiento profesional</h3>
                        <p>
                            Nos unimos a <strong>Zulu Tactical</strong> para ofrecerte productos de defensa personal diseñados para
                            quienes buscan seguridad y confianza en cualquier situación.
                        </p>
                        <div className={styles.botonesZulu}>
                            <a href="#productos" className={styles.heroBtn}>
                                Ver productos
                            </a>
                            <a className={styles.visitStore}>Visita la tienda de zulu tactical</a>
                        </div>
                    </div>
                    <div className={styles.heroRight}>
                        <a>Visita la tienda de zulu tactical</a>
                    </div>
                </section>
                {/* 🧭 QUIÉNES SON */}
                <section className={styles.aboutSection}>
                    <div className={styles.aboutText}>
                        <h2>¿Quién es Zulu Tactical?</h2>
                        <p>
                            <strong>Zulu Tactical</strong> es una marca española especializada en equipamiento táctico y defensa
                            personal. Su compromiso con la calidad, la innovación y la seguridad la ha convertido en un referente
                            dentro del sector, tanto para profesionales como para particulares.
                        </p>
                    </div>
                    <div className={styles.aboutImage}>
                        <Image
                            src="/assets/zulu-team.webp"
                            alt="Equipo de Zulu Tactical"
                            width={600}
                            height={400}
                            className={styles.aboutPhoto}
                        />
                    </div>
                </section>

                {/* 🧱 PRODUCTOS */}
                <section id="productos" className={styles.productsPresentation}>
                    <h2>Algunos productos de Zulu Tactical</h2>
                    <div className={styles.productsGrid}>
                        {products.map((product, index) => (
                            <CombatStrikeProductCard key={index} product={product} index={index} loaded={loaded} />
                        ))}
                    </div>
                </section>

                {/* 🎯 CTA FINAL */}
                <section className={styles.ctaSection}>
                    <h2>Prepárate con lo mejor en defensa personal</h2>
                    <p>
                        Descubre la gama completa de productos de Zulu Tactical y equípate con confianza.
                        Seguridad, calidad y diseño profesional al alcance de tu mano.
                    </p>
                    <a href="/productos" className={styles.heroBtn}>
                        Explorar catálogo completo
                    </a>
                </section>
            </div>
            <Footer />
        </>
    );
}

