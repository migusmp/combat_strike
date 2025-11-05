import { Product } from "../page";
import Image from "next/image";

import styles from '../css/CombatStrikeProductCard.module.css';

interface CombatStrikeProductCardProps {
    product: Product,
    loaded: boolean,
    index: number,
}

// {product.ageWarning && <p>{product.ageWarning}</p>}
// <ul>
//     {product.topics.map((topic, i) => (
//         <li key={i}>{topic}</li>
//     ))}
// </ul>
export default function CombatStrikeProductCard({ product, loaded, index }: CombatStrikeProductCardProps) {
    return (
        <article key={index} className={styles.productCard} data-loaded={loaded}>
            <div className={styles.imageHalo}>
                <Image
                    width={240}
                    height={240}
                    alt={product.title}
                    src={product.image}
                    className={styles.productImage}
                    priority={index < 2}
                />
            </div>

            <p className={styles.productName}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                >
                    <circle cx="8" cy="8" r="8" />
                </svg>
                {product.name}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                >
                    <circle cx="8" cy="8" r="8" />
                </svg>
            </p>

            <div className={styles.divider} />
            <h3 className={styles.productTitle}>{product.title}</h3>
            <div className={styles.divider} />

            <ul className={styles.features}>
                {product.topics.map((topic, i) => (
                    <li key={i}>{topic}</li>
                ))}
            </ul>

            {product.ageWarning && <p className={styles.ageWarning}>{product.ageWarning}</p>}

            <div className={styles.cardFooter}>
                <a href={product.href} className={styles.productBtn}>
                    Ver producto
                </a>
            </div>
        </article>
    );
}
