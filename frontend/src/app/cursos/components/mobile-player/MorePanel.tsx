"use client";
import styles from "../../css/MobilePurchasedCourseContent.module.css";

type Props = {
  progress: number;
  totalSections: number;
  totalClasses: number;
  durationHours: number;
  durationMinutes: number;
  requirements?: string[];
  includes?: string[];
};

export default function MorePanel({
  progress,
  totalSections,
  totalClasses,
  durationHours,
  durationMinutes,
  requirements,
  includes,
}: Props) {
  return (
    <div className={styles.mobileMoreContent}>
      <article className={`${styles.mobileMoreCard} ${styles.mobileMoreHighlight}`}>
        <header>
          <div>
            <p className={styles.mobileTag}>Tu avance</p>
            <h3 className={styles.mobileHeadingAccent}>Progreso actual</h3>
          </div>
          <span className={styles.mobileStat}>{progress}%</span>
        </header>
        <div className={styles.mobileMoreProgress}>
          <span style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <p className={styles.mobileMetaLine}>
          {totalSections} secciones · {totalClasses} clases · {durationHours} h{" "}
          {durationMinutes} min
        </p>
      </article>

      {!!requirements?.length && (
        <article className={styles.mobileMoreCard}>
          <header>
            <div>
              <p className={styles.mobileTag}>Prepárate</p>
              <h3 className={styles.mobileHeadingAccent}>Requisitos</h3>
            </div>
          </header>
          <div className={styles.mobilePillList}>
            {requirements.map((r) => (
              <span key={r} className={styles.mobilePill}>
                {r}
              </span>
            ))}
          </div>
        </article>
      )}

      {!!includes?.length && (
        <article className={styles.mobileMoreCard}>
          <header>
            <div>
              <p className={styles.mobileTag}>Tu compra</p>
              <h3>Incluye</h3>
            </div>
          </header>
          <div className={styles.mobilePillList}>
            {includes.map((i) => (
              <span key={i} className={styles.mobilePill}>
                {i}
              </span>
            ))}
          </div>
        </article>
      )}
    </div>
  );
}
