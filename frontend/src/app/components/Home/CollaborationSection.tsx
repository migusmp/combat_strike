"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "../../css/CollaborationSection.module.css";
import { useEffect, useRef, useState } from "react";

interface Product {
    title: string;
    image: string;
    topics: string[];
    ageWarning?: string;
    href: string;
}

export default function CollaborationSection() {
    const products: Product[] = [
        {
            title: "Spray de Defensa Personal",
            image: "/ruta/spray1.jpg",
            topics: ["Alcance: 3 metros", "Fácil de usar", "Normativa: Cumple con legislación vigente"],
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Gas Pimienta",
            image: "/ruta/spray2.jpg",
            topics: ["Alcance: 4 metros", "Resistente al viento", "Normativa: Cumple con legislación vigente"],
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
    ];

    // Ref y estado para el título
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [titleVisible, setTitleVisible] = useState(false);

    // Refs y estados para cada tarjeta
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [visibleCards, setVisibleCards] = useState<boolean[]>(products.map(() => false));

    useEffect(() => {
        // Observer para el título
        const titleObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTitleVisible(true);
                    titleObserver.unobserve(entry.target);
                }
            },
            { threshold: 0.5 }
        );
        if (titleRef.current) titleObserver.observe(titleRef.current);

        // Observer para las tarjetas
        const cardObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = cardRefs.current.indexOf(entry.target as HTMLDivElement);
                    if (entry.isIntersecting && index !== -1) {
                        setVisibleCards((prev) => {
                            const updated = [...prev];
                            updated[index] = true;
                            return updated;
                        });
                        cardObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );

        cardRefs.current.forEach((card) => {
            if (card) cardObserver.observe(card);
        });

        return () => {
            titleObserver.disconnect();
            cardObserver.disconnect();
        };
    }, []);

    return (
        <section className={styles.collaborationSection}>
            <div className={styles.sectionHeader}>
                <h2
                    ref={titleRef}
                    className={`${styles.sectionTitle} ${titleVisible ? styles.sectionTitleVisible : ""}`}
                >
                    Nuestra Colaboración
                </h2>
                <p
                    className={`${styles.sectionSubtitle} ${titleVisible ? styles.sectionSubtitleVisible : ""}`}
                >
                    Presentamos los productos de{" "}
                    <a
                        href="https://zulutactical.es/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.partnerLink}
                    >
                        Zulu Tactical
                    </a>{" "}
                    para tu defensa personal
                </p>
            </div>

            <div className={styles.collaborationContent}>
                {/* IZQUIERDA */}
                <div className={styles.partnerInfo}>
                    <Image
                        src="/assets/zulu-tactical.png"
                        alt="Logo Zulu Tactical"
                        width={250}
                        height={250}
                        className={styles.partnerLogo}
                    />

                    <p>
                        Zulu Tactical es una empresa especializada en productos de defensa personal
                        y equipamiento táctico. Ofrecen soluciones seguras y legales para tu
                        protección diaria, siempre cumpliendo con la normativa vigente.
                    </p>
                </div>

                {/* DERECHA */}
                <div className={styles.productsContainer}>
                    {products.map((product, index) => (
                        <div
                            key={index}
                            ref={(el) => {
                                if (el) cardRefs.current[index] = el;
                            }}
                            className={`${styles.productCard} ${visibleCards[index] ? styles.productCardVisible : ""}`}
                        >
                            <Image src={product.image} width={0} height={0} alt={product.title} className={styles.productImage} />
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

            <div className={styles.legalNotice}>
                <p>Todos los productos están sujetos a normativa vigente. Solo mayores de 18 años.</p>
            </div>
        </section>
    );
}

