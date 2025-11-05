"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "../../css/CollaborationSection.module.css";
import CombatStrikeProductCard, { ProductCardData } from "@/app/productos/components/CombatStrikeProductCard";

export default function CollaborationSection() {
    const products: ProductCardData[] = [
        {
            title: "Spray de Defensa Personal",
            image: "/assets/spray-pimienta-2.webp",
            name: "Spray clásico",
            topics: ["Alcance efectivo 3 m", "Activación ergonómica", "Homologado en la UE"],
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray de Gas Pimienta",
            image: "/assets/spray-pimienta-1.webp",
            name: "Serie profesional",
            topics: ["Chorro anti-viento", "Producción nacional", "Formulación certificada"],
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
        {
            title: "Spray Compacto",
            image: "/assets/spray-pimienta-2.png",
            name: "Edición urbana",
            topics: ["Formato bolsillo", "Seguro anti-activación", "Uso cotidiano"],
            ageWarning: "Solo para mayores de 18 años",
            href: "/productos",
        },
    ];

    return (
        <section className={styles.collabSection}>
            <div className={styles.collabInner}>
                <div className={styles.collabCopy}>
                    <span className={styles.sectionEyebrow}>Colaboración oficial</span>
                    <h2>Equipamiento táctico junto a Zulu Tactical</h2>
                    <p>
                        Recomendamos su gama de sprays porque responde a los mismos estándares que exigimos en
                        nuestros entrenamientos: fiabilidad, ergonomía y cumplimiento legal.
                    </p>
                    <ul className={styles.collabHighlights}>
                        <li>Formulaciones auditadas con cuerpos de seguridad y formadores</li>
                        <li>Diseños ergonómicos con bloqueos anti-activación accidental</li>
                        <li>Envío rápido desde España y soporte directo de la marca</li>
                    </ul>
                    <div className={styles.collabActions}>
                        <Link href="/productos" className={styles.primaryBtn}>
                            Ver selección de productos
                        </Link>
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
                <div className={styles.collabVisual}>
                    <div className={styles.collabFrame}>
                        <Image
                            src="/assets/spray-pimienta-1.webp"
                            alt="Spray Zulu Tactical"
                            fill
                            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 40vw, 320px"
                            className={styles.collabImage}
                        />
                        <span className={styles.collabBadge}>Protección inmediata</span>
                    </div>
                    <div className={styles.collabStats}>
                        <div>
                            <strong>+10</strong>
                            <span>Años de experiencia</span>
                        </div>
                        <div>
                            <strong>100%</strong>
                            <span>Producción nacional</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.collabProducts}>
                {products.map((product, index) => (
                    <CombatStrikeProductCard key={index} product={product} index={index} />
                ))}
            </div>

            <p className={styles.collabLegal}>
                Todos los productos están sujetos a la normativa vigente. Venta exclusiva para mayores de 18 años.
            </p>
        </section>
    );
}
