import styles from "../../css/Home.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <span>© {new Date().getFullYear()} DL Combat Strike</span>
        <nav className={styles.footerNav}>
          <a href="#about">Sobre nosotros</a>
          <a href="#cursos">Cursos</a>
          <a href="#tienda">Tienda</a>
          <a href="#valores">Valores</a>
          <a href="#contact">Contacto</a>
        </nav>
      </div>
    </footer>
  );
}