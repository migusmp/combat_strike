"use client";
import styles from "../../css/MobilePurchasedCourseContent.module.css";
import { SubtitleTrack } from "@/app/interfaces/courses";

type Props = {
  selected: "off" | string;
  tracks: SubtitleTrack[];
  onSelect: (lang: "off" | string) => void;
  onClose: () => void;
};

export default function SettingsModal({ selected, tracks, onSelect, onClose }: Props) {
  return (
    <div className={styles.settingsModalBackdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.settingsModal}>
        <header className={styles.settingsHeader}>
          <h3>Configuración del video</h3>
          <button className={styles.closeSettings} onClick={onClose} aria-label="Cerrar configuración">✕</button>
        </header>

        <div className={styles.settingsSection}>
          <span className={styles.settingsLabel}>Subtítulos</span>
          <ul className={styles.settingsList}>
            <li>
              <button
                onClick={() => onSelect("off")}
                className={selected === "off" ? styles.settingsActive : ""}
              >
                Desactivados
              </button>
            </li>
            {tracks?.map((t) => (
              <li key={t.lang}>
                <button
                  onClick={() => onSelect(t.lang)}
                  className={selected === t.lang ? styles.settingsActive : ""}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Añade futuras opciones aquí */}
      </div>
    </div>
  );
}