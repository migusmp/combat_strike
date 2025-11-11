"use client";
import styles from "../../css/MobilePurchasedCourseContent.module.css";
import { ContentSection } from "@/app/interfaces/courses";

type Props = {
  sections: ContentSection[];
  selectedSection: number;
  selectedClass: number;
  onSelect: (s: number, c: number) => void;
  formatDuration: (h: number, m: number) => string;
};

export default function SectionList({
  sections, selectedSection, selectedClass, onSelect, formatDuration,
}: Props) {
  return (
    <div className={styles.mobileSectionList}>
      {sections.map((section, sectionIdx) => (
        <div key={section.sectionTitle} className={styles.mobileSectionCard}>
          <header className={styles.mobileSectionHeader}>
            <div>
              <span className={styles.mobileSectionLabel}>Sección {sectionIdx + 1}</span>
              <h3>{section.sectionTitle}</h3>
            </div>
            <span className={styles.mobileSectionMeta}>{section.classes.length} clases</span>
          </header>

          <ul>
            {section.classes.map((cls, classIdx) => {
              const isActive = selectedSection === sectionIdx && selectedClass === classIdx;
              return (
                <li key={`${section.sectionTitle}-${classIdx}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(sectionIdx, classIdx)}
                    className={`${styles.mobileClassButton} ${isActive ? styles.mobileClassButtonActive : ""}`}
                  >
                    <span className={styles.mobileClassIndex}>{classIdx + 1}</span>
                    <div>
                      <p>{cls.title}</p>
                      <small>Video · {formatDuration(cls.duration.hours, cls.duration.minutes)}</small>
                    </div>
                    <span className={styles.mobileClassIcon} aria-hidden="true">↓</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
