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
            image: "/assets/spray-pimienta-2.png",
            topics: ["Alcance: 3 metros", "Fácil de usar", "Normativa: Cumple con legislación vigente"],
            name: "Spray de defensa",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Gas Pimienta",
            image: "/assets/spray-pimienta-1.png",
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

    return (
        <>
            <div className={styles.container}>
                <div className={styles.logoWrapper}>
                    <Image src="/assets/zulu-tactical.webp" alt="Zulu Tactical Logo" width={250} height={250} />
                </div>

                <div className={styles.productsGrid}>
                    {products.map((product, index) => (
                        <CombatStrikeProductCard key={index} product={product} index={index} loaded={loaded} />
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}

