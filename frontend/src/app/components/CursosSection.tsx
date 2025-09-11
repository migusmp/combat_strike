import styles from "../css/Home.module.css";

export default function CursosSection() {
  return (
    <section className={styles.cursosSection}>
      <div className={styles.cursosGrid}>
        <div className={styles.cursoVideo}>
          <span className={styles.cursoLabel}>VIDEO INTRODUCCIÓN</span>
        </div>
        <div className={styles.cursoInfoBlock}>
          <div className={styles.cursoInfo}>
            <span className={styles.cursoLabel}>EXPLICACIÓN DE LOS CURSOS</span>
          </div>
          <div className={styles.cursoButtonRow}>
            <button className={styles.cursoButton}>VER CURSOS</button>
          </div>
        </div>
      </div>
    </section>
  );
}