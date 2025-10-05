"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "../../css/CollaborationSection.module.css";

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
            image: "/assets/spray-pimienta-1.png",
            topics: ["Alcance: 3 metros", "Fácil de usar", "Normativa: Cumple con legislación vigente"],
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Gas Pimienta",
            image: "/assets/spray-pimienta-2.png",
            topics: ["Alcance: 4 metros", "Resistente al viento", "Normativa: Cumple con legislación vigente"],
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Gas Pimienta",
            image: "/assets/spray-pimienta-2.png",
            topics: ["Alcance: 4 metros", "Resistente al viento", "Normativa: Cumple con legislación vigente"],
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
    ];

    return (
        <section className={styles.collaborationSection}>
            <div className={styles.sectionHeader}>
                <Image
                    src="/assets/zulu-tactical.webp"
                    alt="Logo Zulu Tactical"
                    width={250}
                    height={250}
                    className={styles.partnerLogo}
                />
                <p className={styles.sectionSubtitle}>
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
                <div className={styles.productsContainer}>
                    {products.map((product, index) => (
                        <div key={index} className={styles.productCard}>
                            <Image
                                src={product.image}
                                width={150}
                                height={50}
                                alt={product.title}
                                className={styles.productImage}
                            />
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
