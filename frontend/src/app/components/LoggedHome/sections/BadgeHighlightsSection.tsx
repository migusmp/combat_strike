"use client";

import styles from "../css/NewUserHome.module.css";
import { BadgeHighlight } from "../data/content";

type Props = {
    badges: BadgeHighlight[];
};

export default function BadgeHighlightsSection({ badges }: Props) {
    return (
        <section className={styles.badgesSection}>
            <div className={styles.sectionHeader}>
                <span className={styles.sectionEyebrow}>Insignias</span>
                <h2>Recién estás arrancando</h2>
                <p className={styles.emptyStateNote}>
                    Completa las micro misiones para desbloquear tu primera insignia antes de 72h.
                </p>
            </div>
            <div className={styles.badgesGrid}>
                {badges.map((badge) => (
                    <article key={badge.title} className={styles.badgeCard}>
                        <span className={styles.pill}>{badge.label}</span>
                        <h3>{badge.title}</h3>
                        <p>{badge.description}</p>
                        <footer>
                            <strong>{badge.status}</strong>
                            <button type="button">Ver requisitos</button>
                        </footer>
                    </article>
                ))}
            </div>
        </section>
    );
}
