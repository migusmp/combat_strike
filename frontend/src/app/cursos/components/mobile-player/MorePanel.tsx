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
  progress, totalSections, totalClasses, durationHours, durationMinutes, requirements, includes,
}: Props) {
  return (
    <div className={styles.mobileMoreContent}>
      <article className={styles.mobileMoreCard}>
        <header>
          <span>Progreso actual</span>
          <strong>{progress}%</strong>
        </header>
        <div className={styles.mobileMoreProgress}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <p>
          {totalSections} secciones · {totalClasses} clases · {durationHours} h {durationMinutes} min
        </p>
      </article>

      {!!requirements?.length && (
        <article className={styles.mobileMoreCard}>
          <header><span>Requisitos</span></header>
          <ul>{requirements.map((r) => <li key={r}>{r}</li>)}</ul>
        </article>
      )}

      {!!includes?.length && (
        <article className={styles.mobileMoreCard}>
          <header><span>Incluye</span></header>
          <ul>{includes.map((i) => <li key={i}>{i}</li>)}</ul>
        </article>
      )}
    </div>
  );
}
