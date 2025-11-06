"use client";

import styles from "../css/LoggedHome.module.css";
import { ActivityItem } from "../data/content";

type Props = {
    items: ActivityItem[];
};

export default function ActivityFeedSection({ items }: Props) {
    if (!items.length) {
        return null;
    }

    return (
        <section className={styles.feedSection}>
            <div className={styles.feedHeader}>
                <span className={styles.sectionEyebrow}>Resumen reciente</span>
                <h2>Tu actividad</h2>
            </div>
            <ul className={styles.feedList}>
                {items.map((item) => (
                    <li key={item.id}>
                        <span>{item.label}</span>
                        <small>{item.date}</small>
                    </li>
                ))}
            </ul>
        </section>
    );
}
