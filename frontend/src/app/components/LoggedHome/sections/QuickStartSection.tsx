"use client";

import Link from "next/link";
import styles from "../css/NewUserHome.module.css";
import { QuickAction } from "../data/content";

type Props = {
    items: QuickAction[];
};

export default function QuickStartSection({ items }: Props) {
    return (
        <section className={styles.quickSection}>
            <div className={styles.sectionHeader}>
                <span className={styles.sectionEyebrow}>Primeros pasos</span>
                <h2>Completa tu kit de entrada</h2>
                <p className={styles.emptyStateNote}>
                    Cada paso desbloquea recomendaciones más precisas y un onboarding más rápido.
                </p>
            </div>
            <div className={styles.actionsSection}>
                {items.map((item) => (
                    <article key={item.title} className={styles.actionCard}>
                        <span>{item.eyebrow}</span>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <Link href={item.href}>{item.action}</Link>
                    </article>
                ))}
            </div>
        </section>
    );
}
