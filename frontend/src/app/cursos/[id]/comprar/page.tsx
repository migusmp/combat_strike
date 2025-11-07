"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import useCourses from "@/app/hooks/useCourses";
import styles from "./CourseCheckout.module.css";

const paymentMethods = [
    {
        id: "paypal",
        label: "PayPal",
        description: "Pago seguro con tu cuenta PayPal o tarjeta asociada.",
        badge: "Recomendado",
    },
    {
        id: "revolut",
        label: "Revolut Pay",
        description: "Autorización instantánea desde tu app Revolut.",
        badge: "Nuevo",
    },
];

const guarantees = [
    "Acceso de por vida al contenido actualizado",
    "Cancelación gratuita antes de iniciar el curso",
    "Protección de pago y soporte prioritario",
];

export default function CourseCheckoutPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const { courses, isLoading, error } = useCourses();
    const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].id);

    const course = useMemo(() => {
        const numericId = Number(id);
        return courses?.find((item) => item.id === numericId);
    }, [courses, id]);

    if (isLoading) {
        return (
            <div className={styles.stateWrapper}>
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.stateWrapper}>
                <p className={styles.error}>No pudimos cargar el curso: {error}</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className={styles.stateWrapper}>
                <p className={styles.error}>No encontramos el curso solicitado.</p>
                <Link href="/cursos" className={styles.linkButton}>
                    Volver al catálogo
                </Link>
            </div>
        );
    }

    const coursePrice = Number(course.price) || parseFloat(course.price.replace(",", ".")) || 0;
    const taxes = coursePrice * 0.21;
    const total = coursePrice + taxes;

    return (
        <main className={styles.checkoutWrapper}>
            <section className={styles.heroPanel}>
                <button type="button" className={styles.backLink} onClick={() => router.back()}>
                    <span className={styles.backLinkIcon}>←</span>
                    Regresar
                </button>
                <div className={styles.heroContent}>
                    <div>
                        <span className={styles.heroEyebrow}>Estás comprando</span>
                        <h1>{course.title}</h1>
                        <p>{course.description}</p>
                    </div>
                    <div className={styles.heroChips}>
                        <span>Última actualización • {new Date(course.updated_at).toLocaleDateString("es-ES")}</span>
                        <span>{course.language}</span>
                    </div>
                </div>
                <div className={styles.courseSnapshot}>
                    <div className={styles.snapshotMedia}>
                        <Image src={course.image} alt={course.title} fill sizes="320px" />
                    </div>
                    <div className={styles.snapshotDetails}>
                        <strong>{coursePrice.toFixed(2)} €</strong>
                        <p>Incluye módulos completos, bonus descargables y soporte vitalicio.</p>
                        <ul>
                            {(course.includes ?? []).slice(0, 3).map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className={styles.checkoutGrid}>
                <div className={styles.summaryCard}>
                    <h2>Resumen de tu pedido</h2>
                    <div className={styles.summaryRow}>
                        <span>{course.title}</span>
                        <strong>{coursePrice.toFixed(2)} €</strong>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>IVA (21%)</span>
                        <strong>{taxes.toFixed(2)} €</strong>
                    </div>
                    <div className={styles.summaryTotal}>
                        <span>Total</span>
                        <strong>{total.toFixed(2)} €</strong>
                    </div>
                    <p className={styles.summaryNote}>Recibirás un comprobante en tu correo al completar el pago.</p>
                </div>

                <div className={styles.paymentCard}>
                    <div className={styles.paymentHeader}>
                        <span>Metodos disponibles</span>
                        <p>Selecciona una pasarela para completar tu compra.</p>
                    </div>
                    <div className={styles.methodsList}>
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                type="button"
                                className={`${styles.methodButton} ${
                                    selectedMethod === method.id ? styles.methodActive : ""
                                }`}
                                onClick={() => setSelectedMethod(method.id)}
                            >
                                <div>
                                    <span>{method.label}</span>
                                    <small>{method.description}</small>
                                </div>
                                <span className={styles.methodBadge}>{method.badge}</span>
                            </button>
                        ))}
                    </div>
                    <button type="button" className={styles.primaryButton}>
                        {selectedMethod === "paypal" ? "Pagar con PayPal" : "Pagar con Revolut Pay"}
                    </button>
                    <p className={styles.legalDisclaimer}>
                        Al continuar aceptas nuestros términos de servicio. Los pagos no son reembolsables.
                    </p>
                    <div className={styles.guaranteeList}>
                        {guarantees.map((item) => (
                            <div key={item}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.6"
                                        d="m5 12 4 4 10-10"
                                    />
                                </svg>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
