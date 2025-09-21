"use client"
import CursosPage from "@/app/cursos/page";
import AboutSection from "./AboutSection";
import MissionVisionSection from "./MissionVisionSection";
import ValoresSection from "./ValoresSection";
import Footer from "./Footer";
import styles from "../../css/Home.module.css";
import Image from 'next/image';

export default function LandingPage1() {
    return (
        <>
            <section className={styles.heroSection}>
                <div className={styles.heroImage}>
                    <Image
                        src="/assets/imagen_principal.jpg"
                        alt="Fotografía de la naturaleza con montañas y cielo azul"
                        fill
                        priority
                        className={styles.image}
                    />
                    <div className={styles.overlay}></div>
                </div>
            </section>
            <AboutSection />
            <MissionVisionSection />
            <ValoresSection />
            <CursosPage />
            <Footer />
        </>
    );
}