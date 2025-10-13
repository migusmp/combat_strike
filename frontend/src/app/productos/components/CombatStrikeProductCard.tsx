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

    return <article key={index} className={styles.productCard}>
        <Image width={100} height={100} alt={product.title} src={product.image} className={styles.productImage} />
        <p className={styles.productName}><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" className="bi bi-circle-fill" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="8" />
        </svg>{product.name}<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" className="bi bi-circle-fill" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8" />
            </svg></p>
        <div className={styles.divider}></div>
        <h3 className={styles.productTitle}>{product.title}</h3>
        <div className={styles.divider}></div>
        <a href={product.href} className={styles.productBtn}>Ver Producto</a>
    </article>

}
