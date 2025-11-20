"use client";
import styles from "../../css/MobilePurchasedCourseContent.module.css";

type Props = {
  items: string[];
  fallbackIncludes?: string[];
  sections?: { sectionTitle: string; downloadables?: string[] }[];
};

export default function DownloadablesPanel({ items, fallbackIncludes, sections }: Props) {
  const downloadablesToShow =
    (items?.length && items) ||
    fallbackIncludes?.filter((item) =>
      /(pdf|descargable|gu[ií]a|plantilla|kit|material)/i.test(item),
    ) ||
    [];

  const sectionDownloadables =
    sections
      ?.filter((section) => section.downloadables?.length)
      .map((section) => ({
        title: section.sectionTitle,
        items: section.downloadables ?? [],
      })) ?? [];

  const isProbablyLoading =
    !sections?.length && !items?.length && !fallbackIncludes?.length;

  const hasGeneral = downloadablesToShow.length > 0;
  const hasSections = sectionDownloadables.length > 0;

  return (
    <div className={styles.mobileMoreContent}>
      <article className={`${styles.mobileMoreCard} ${styles.mobileDownloadsSurface}`}>
        <header>
          <div>
            <p className={styles.mobileTag}>Descargas</p>
            <h3 className={styles.mobileHeadingAccent}>Contenido descargable</h3>
          </div>
        </header>

        {hasSections && (
          <div className={styles.mobileDownloadSections}>
            {sectionDownloadables.map((section) => (
              <div key={section.title} className={styles.mobileDownloadSection}>
                <p className={styles.mobileDownloadSectionTitle}>{section.title}</p>
                <div className={styles.mobilePillList}>
                  {section.items.map((item) => (
                    <span key={item} className={styles.mobilePill}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasGeneral && (
          <div className={styles.mobileDownloadExtras}>
            <p className={styles.mobileDownloadSectionTitle}>Extras del curso</p>
            <div className={styles.mobilePillList}>
              {downloadablesToShow.map((item) => (
                <span key={item} className={styles.mobilePill}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {!hasSections && !hasGeneral && isProbablyLoading && (
          <div className={styles.mobileSkeletonBlock}>
            <div className={styles.mobileSkeletonLineWide} />
            <div className={styles.mobileSkeletonPills}>
              <span />
              <span />
              <span />
            </div>
            <p className={styles.mobileHint}>Cargando material descargable...</p>
          </div>
        )}

        {!hasSections && !hasGeneral && !isProbablyLoading && (
          <p className={styles.mobileHint}>No hay contenido descargable disponible aún.</p>
        )}
      </article>
    </div>
  );
}
