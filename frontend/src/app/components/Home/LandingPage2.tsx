"use client";
import Image from "next/image";
import styles from "../../css/LandingPage2.module.css";
import Link from "next/link";

export default function LandingPage2() {
  return (
    <section className={styles.container}>
      <div className={styles.textContainer}>
        <h1 className={styles.title}>COMBAT STRIKE</h1>
        <p className={styles.description}>
          DL Combat Strike es una marca de deportes de contacto enfocada en la
          seguridad personal y basada en técnicas de krav maga israelí. Cuya
          misión es permitir que las personas tengan la oportunidad de saber
          defenderse y tener conocimientos básicos de defensa basada en
          situaciones reales. La marca atrae a una comunidad única llena de
          actitud de quienes buscan aprender y convertirse en luchadores.
        </p>
        <Link href="/login" className={styles.ctaBtn}>Empieza aquí</Link>
      </div>
      <div className={styles.imageContainer}>
        <Image
          src="/assets/logo-blanco-sin-texto.png"
          width={600}
          height={600}
          alt="DL Combat Strike logo"
          className={styles.image}
        />
      </div>
    </section>
  );
}
