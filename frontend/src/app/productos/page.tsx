"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/Home/Footer";
import styles from "../css/Productos.module.css";
import Image from "next/image";

interface Product {
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
            image: "/ruta/spray1.jpg",
            topics: ["Alcance: 3 metros", "Fácil de usar", "Normativa: Cumple con legislación vigente"],
            name: "Spray de Defensa Personal",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Gas Pimienta",
            image: "/ruta/spray2.jpg",
            topics: ["Alcance: 4 metros", "Resistente al viento", "Normativa: Cumple con legislación vigente"],
            name: "Spray de Defensa Personal",
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Defensa Personal",
            image: "/ruta/spray1.jpg",
            name: "Spray de Defensa Personal",
            topics: ["Alcance: 3 metros", "Fácil de usar", "Normativa: Cumple con legislación vigente"],
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Gas Pimienta",
            image: "/ruta/spray2.jpg",
            name: "Spray de Defensa Personal",
            topics: ["Alcance: 4 metros", "Resistente al viento", "Normativa: Cumple con legislación vigente"],
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
    ];

    return (
        <>
            <div className={styles.container}>
                <div className={styles.logoWrapper}>
                    <Image src="/assets/zulu-tactical.webp" alt="Zulu Tactical Logo" width={250} height={250} />
                </div>

                <div className={styles.productsGrid}>
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className={`${styles.productCard} ${loaded ? styles.fadeInUp : ""}`}
                            style={{ animationDelay: `${index * 0.2}s` }}
                        >
                            <Image width={100} height={100} src={product.image} alt={product.title} className={styles.productImage} />
                            <h3 className={styles.productTitle}>{product.title}</h3>
                            {product.ageWarning && <p className={styles.ageWarning}>{product.ageWarning}</p>}
                            <ul className={styles.productTopics}>
                                {product.topics.map((topic, i) => (
                                    <li key={i}>{topic}</li>
                                ))}
                            </ul>
                            <Link href={product.href} className={styles.productBtn}>
                                Ver Producto
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}

