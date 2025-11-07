"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import useCourses from "@/app/hooks/useCourses";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"; // ✅ SDK oficial PayPal
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const course = useMemo(() => {
    const numericId = Number(id);
    return courses?.find((item) => item.id === numericId);
  }, [courses, id]);

  const parsedPrice = (() => {
    if (course?.price == null) return 0;
    if (typeof course.price === "number") return course.price;
    const sanitized = String(course.price).replace(",", ".");
    const numeric = Number(sanitized);
    return Number.isNaN(numeric) ? 0 : numeric;
  })();
  const coursePrice = parsedPrice;
  const taxes = coursePrice * 0.21;
  const total = coursePrice + taxes;
  const totalAmount = total.toFixed(2);

  // ✅ URL de tu backend NestJS (ajústala según tu dominio o .env)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const isPayPalConfigured = Boolean(paypalClientId);

  const handleCreateOrder = useCallback(async () => {
    if (!isPayPalConfigured) {
      const error = new Error("PayPal no está configurado");
      setStatusMessage("Configura tus credenciales de PayPal antes de continuar.");
      throw error;
    }

    setIsProcessing(true);
    setStatusMessage("Creando la orden en PayPal…");
    try {
      const res = await fetch(`${API_URL}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: totalAmount }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Error al crear orden: ${res.status} ${body}`);
      }

      const data = await res.json();
      if (!data?.id) {
        throw new Error("La respuesta no incluye un ID de orden");
      }

      setStatusMessage("Orden lista. Completa la aprobación en PayPal.");
      return data.id;
    } catch (error) {
      console.error("Error al crear la orden:", error);
      setStatusMessage("No pudimos iniciar tu pago. Inténtalo de nuevo.");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [API_URL, isPayPalConfigured, totalAmount]);

  const captureOrder = useCallback(
    async (orderId: string) => {
      setIsProcessing(true);
      setStatusMessage("Capturando el pago…");
      try {
        const res = await fetch(`${API_URL}/payments/capture-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, courseId: course?.id}),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Error al capturar orden: ${res.status} ${body}`);
        }

        const result = await res.json();
        setStatusMessage("Pago confirmado. Redirigiendo a tu contenido…");
        return result;
      } catch (error) {
        console.error("Error al capturar la orden:", error);
        setStatusMessage("No pudimos confirmar tu pago. Inténtalo más tarde.");
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [API_URL]
  );

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
            <span>
              Última actualización •{" "}
              {new Date(course.updated_at).toLocaleDateString("es-ES")}
            </span>
            <span>{course.language}</span>
          </div>
        </div>
        <div className={styles.courseSnapshot}>
          <div className={styles.snapshotMedia}>
            <Image src={course.image} alt={course.title} fill sizes="320px" />
          </div>
          <div className={styles.snapshotDetails}>
            <strong>{coursePrice.toFixed(2)} €</strong>
            <p>
              Incluye módulos completos, bonus descargables y soporte vitalicio.
            </p>
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
          <p className={styles.sectionTitle}>Resumen de tu pedido</p>
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
          <p className={styles.summaryNote}>
            Recibirás un comprobante en tu correo al completar el pago.
          </p>
        </div>

        <div className={styles.paymentCard}>
          <div className={styles.paymentHeader}>
            <p className={styles.sectionTitle}>Métodos disponibles</p>
            <p>Selecciona una pasarela para completar tu compra.</p>
          </div>

          {/* 🔹 Selector de método de pago */}
          <div className={styles.methodsList}>
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                className={`${styles.methodButton} ${
                  selectedMethod === method.id ? styles.methodActive : ""
                }`}
                onClick={() => setSelectedMethod(method.id)}
                disabled={isProcessing}
              >
                <div>
                  <span>{method.label}</span>
                  <small>{method.description}</small>
                </div>
                <span className={styles.methodBadge}>{method.badge}</span>
              </button>
            ))}
          </div>

          {/* 🔹 Renderizado condicional del botón PayPal */}
          {selectedMethod === "paypal" ? (
            <div className={styles.paypalContainer}>
              {isPayPalConfigured ? (
                <PayPalScriptProvider
                  options={{
                    "client-id": paypalClientId!,
                    currency: "EUR",
                  }}
                >
                  <div className={styles.paypalInner}>
                    <PayPalButtons
                      style={{ layout: "vertical" }}
                      createOrder={handleCreateOrder}
                      forceReRender={[totalAmount]}
                      onApprove={async (data) => {
                        try {
                          await captureOrder(data.orderID);
                          router.push(`/gracias?curso=${course.id}`);
                        } catch (error) {
                          console.error("❌ Error finalizando el pago:", error);
                        }
                      }}
                      onCancel={() => {
                        setIsProcessing(false);
                        setStatusMessage("Cancelaste el pago. Puedes intentarlo de nuevo.");
                      }}
                      onError={(err) => {
                        console.error("❌ Error en el pago:", err);
                        setStatusMessage("Hubo un problema con PayPal. Inténtalo nuevamente.");
                        setIsProcessing(false);
                      }}
                      disabled={!isPayPalConfigured || isProcessing}
                    />
                    <p className={styles.paypalStatus}>
                      {statusMessage ?? "Serás redirigido a PayPal para finalizar tu compra."}
                    </p>
                    {isProcessing && (
                      <div className={styles.processingOverlay}>
                        <span className={styles.processingSpinner} />
                        <span>Procesando…</span>
                      </div>
                    )}
                  </div>
                </PayPalScriptProvider>
              ) : (
                <div className={styles.paypalWarning}>
                  <strong>PayPal no está configurado.</strong>
                  <p>
                    Define <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> en tu archivo <code>.env</code> y
                    recarga la página.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className={styles.primaryButton}
              disabled={isProcessing}
              onClick={() => alert("Revolut Pay aún no implementado")}
            >
              Pagar con Revolut Pay
            </button>
          )}

          <p className={styles.legalDisclaimer}>
            Al continuar aceptas nuestros términos de servicio. Los pagos no son reembolsables.
          </p>

          {/* 🔹 Garantías */}
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
