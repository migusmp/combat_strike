"use client";
import { useEffect, useState } from "react";
import Footer from "../components/Home/Footer";
import styles from "../css/Productos.module.css";
import Image from "next/image";
// import CardStyle from "./components/CardStyle";
import CombatStrikeProductCard from "./components/CombatStrikeProductCard";

export interface Product {
    title: string;
    image: string;
    name: string;
    topics: string[];
    ageWarning?: string;
    href: string;
}

export default function ShopPage() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Activa animación después de montar
        setLoaded(true);
    }, []);

    const products: Product[] = [
        {
            title: "Spray de Defensa Personal",
            image: "/assets/spray-pimienta-2.webp",
            topics: ["Alcance: 3 metros", "Fácil de usar", "Normativa: Cumple con legislación vigente"],
            name: "Spray de defensa",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Gas Pimienta",
            image: "/assets/spray-pimienta-1.webp",
            topics: ["Alcance: 4 metros", "Resistente al viento", "Normativa: Cumple con legislación vigente"],
            name: "Spray de defensa",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Defensa Personal",
            image: "/assets/spray-pimienta-2.png",
            name: "Spray de defensa",
            topics: ["Alcance: 3 metros", "Fácil de usar", "Normativa: Cumple con legislación vigente"],
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Gas Pimienta",
            image: "/assets/spray-pimienta-1.png",
            name: "Spray de defensa",
            topics: ["Alcance: 4 metros", "Resistente al viento", "Normativa: Cumple con legislación vigente"],
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
    ];
    // <CardStyle product={product} key={index} loaded={loaded} index={index} />
    // <div className={styles.productsGrid}>
    //                 {products.map((product, index) => (
    //                     <CombatStrikeProductCard key={index} product={product} index={index} loaded={loaded} />
    //                 ))}
    //             </div>

    return (
        <>
            <div className={styles.container}>
                <section className={styles.hero}>
                    <div className={styles.heroLeft}>
                        <Image
                            src="/assets/zulu-tactical.webp"
                            alt="Zulu Tactical Logo"
                            width={300}
                            height={300}
                            className={styles.heroLogo}
                        />
                        <h1>Colaboración con <span>Zulu Tactical</span></h1>
                        <h3 className={styles.subtitle}>Innovación y defensa personal de élite</h3>
                        <p>Nos unimos a Zulu Tactical para ofrecerte productos de defensa personal con la máxima calidad y fiabilidad.</p>
                    </div>
                    <div className={styles.heroRight}>
                        
                        <a href="#productos" className={styles.heroBtn}>
                            Ver productos
                        </a>
                    </div>
                </section>

                <section id="productos" className={styles.productsPresentation}>
                    <h2>Productos Zulu Tactical</h2>
                    {/* Aquí tu grid de productos */}
                    <div className={styles.productsGrid}>
                        {products.map((product, index) => (
                            <CombatStrikeProductCard key={index} product={product} index={index} loaded={loaded} />
                        ))}
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}

