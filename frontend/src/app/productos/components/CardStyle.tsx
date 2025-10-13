import { Product } from "../page";
import Image from "next/image";
import styles from "../../css/Productos.module.css";
import Link from "next/link";

interface CardStyleProps {
    product: Product;
    index: number;
    loaded: boolean;
}

export default function CardStyle({ product, index, loaded }: CardStyleProps) {
    return (
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
    );
}
