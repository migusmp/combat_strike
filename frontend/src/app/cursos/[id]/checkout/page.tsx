"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import useCourses from "@/app/hooks/useCourses";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import styles from "./CourseCheckout.module.css";

/**
 * 💳 Métodos de pago disponibles en la interfaz.
 * Solo PayPal está funcional; los demás pueden añadirse en el futuro.
 */
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

/**
 * 🔒 Garantías visuales que generan confianza durante la compra.
 */
const guarantees = [
  "Acceso de por vida al contenido actualizado",
  "Cancelación gratuita antes de iniciar el curso",
  "Protección de pago y soporte prioritario",
];

export default function CourseCheckoutPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { courses, isLoading, error } = useCourses();

  // Estado de UI
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  /**
   * 🧾 Selecciona el curso actual desde el listado global cargado por el hook.
   */
  const course = useMemo(() => {
    const numericId = Number(id);
    return courses?.find((item) => item.id === numericId);
  }, [courses, id]);

  /**
   * 💰 Parseo del precio (permite formatos con coma, string o número).
   */
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

  /**
   * ⚙️ Configuración de entorno:
   * - API_URL → backend NestJS
   * - PAYPAL_CLIENT_ID → credenciales públicas de PayPal
   * - PAYMENTS_MODE → define modo test o live
   */
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const paymentsMode = process.env.NEXT_PUBLIC_PAYMENTS_MODE || "live";
  const useNextMocks = paymentsMode === "test"; // usa las rutas Next API locales
  const useBackendMocks = paymentsMode === "backend-mock"; // usa /payments/mock/* del backend Nest
  const forceDevTest =
    process.env.NODE_ENV !== "production" && paymentsMode === "live";
  const useTestGateway = useNextMocks || useBackendMocks || forceDevTest;
  const isPayPalConfigured = Boolean(paypalClientId);
  const testModeDescription = useNextMocks
    ? "Modo prueba frontend: las órdenes se simulan dentro de Next.js sin tocar el backend."
    : useBackendMocks
      ? "Modo prueba backend: hablamos con /payments/mock/* para probar el servidor Nest."
      : "Modo desarrollo: se envían importes simbólicos (0.01 €) a PayPal sandbox.";

  // Endpoints reales o mock
  const createOrderEndpoint = useNextMocks
    ? "/api/payments/mock-create"
    : useBackendMocks
      ? `${API_URL}/payments/mock/create-order`
      : `${API_URL}/payments/create-order`;
  const captureOrderEndpoint = useNextMocks
    ? "/api/payments/mock-capture"
    : useBackendMocks
      ? `${API_URL}/payments/mock/capture-order`
      : `${API_URL}/payments/capture-order`;

  /**
   * 🚀 Crea la orden de pago en PayPal (modo live o test).
   * En modo de prueba, fuerza el valor a 0.01 €.
   */
  const handleCreateOrder = useCallback(async () => {
    if (!useNextMocks && !useBackendMocks && !isPayPalConfigured) {
      const error = new Error("PayPal no está configurado");
      setStatusMessage(
        "Configura tus credenciales de PayPal antes de continuar."
      );
      throw error;
    }

    setIsProcessing(true);
    setStatusMessage(
      useTestGateway
        ? useNextMocks
          ? "Generando orden simulada en el frontend…"
          : useBackendMocks
            ? "Generando orden simulada en el backend…"
            : "Generando orden de prueba en PayPal sandbox…"
        : "Creando la orden en PayPal…"
    );

    try {
      // 💡 En modo test (sandbox o backend mock) usamos 0.01 €. Para el mock frontend usamos el total real.
      const totalToSend = useNextMocks
        ? totalAmount
        : useTestGateway
          ? "0.01"
          : totalAmount;

      const res = await fetch(createOrderEndpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: totalToSend }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Error al crear orden: ${res.status} ${body}`);
      }

      const data = await res.json();
      if (!data?.id) throw new Error("La respuesta no incluye un ID de orden");

      setStatusMessage(
        useTestGateway
          ? useNextMocks
            ? "Orden mock creada desde el frontend. Completa el flujo simulado."
            : useBackendMocks
              ? "Orden mock creada desde el backend. Continúa con la captura."
              : "Orden de prueba creada en PayPal sandbox."
          : "Orden lista. Completa la aprobación en PayPal."
      );

      return data.id;
    } catch (error) {
      console.error("❌ Error al crear la orden:", error);
      setStatusMessage("No pudimos iniciar tu pago. Inténtalo de nuevo.");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [
    createOrderEndpoint,
    isPayPalConfigured,
    totalAmount,
    useBackendMocks,
    useNextMocks,
    useTestGateway,
  ]);

  /**
   * 💳 Captura la orden una vez aprobada por el usuario.
   * El backend registra la compra en BD si el pago fue exitoso.
   */
  const captureOrder = useCallback(
    async (orderId: string) => {
      setIsProcessing(true);
      setStatusMessage(
        useTestGateway
          ? useNextMocks
            ? "Confirmando pago de prueba en el frontend…"
            : useBackendMocks
              ? "Confirmando pago simulado en el backend…"
              : "Capturando pago en modo sandbox…"
          : "Capturando el pago…"
      );

      try {
        const res = await fetch(captureOrderEndpoint, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, courseId: course?.id }),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Error al capturar orden: ${res.status} ${body}`);
        }

        const result = await res.json();
        setStatusMessage("Pago confirmado. Redirigiendo a tu contenido…");
        return result;
      } catch (error) {
        console.error("❌ Error al capturar la orden:", error);
        setStatusMessage("No pudimos confirmar tu pago. Inténtalo más tarde.");
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [captureOrderEndpoint, course?.id, useBackendMocks, useNextMocks, useTestGateway]
  );

  /**
   * 🔁 Para modos mock (frontend o backend): crea y captura la orden sin abrir PayPal.
   */
  const handleSimulatedPayment = useCallback(async () => {
    try {
      const mockOrderId = await handleCreateOrder();
      await captureOrder(mockOrderId);
      router.push(`/gracias?curso=${course?.id}`);
    } catch (error) {
      console.error("❌ Error en el flujo mock:", error);
    }1
  }, [captureOrder, course?.id, handleCreateOrder, router]);

  // 🔄 Estados de carga / error / no encontrado
  if (isLoading)
    return (
      <div className={styles.stateWrapper}>
        <LoadingSpinner />
      </div>
    );

  if (error)
    return (
      <div className={styles.stateWrapper}>
        <p className={styles.error}>No pudimos cargar el curso: {error}</p>
      </div>
    );

  if (!course)
    return (
      <div className={styles.stateWrapper}>
        <p className={styles.error}>No encontramos el curso solicitado.</p>
        <Link href="/cursos" className={styles.linkButton}>
          Volver al catálogo
        </Link>
      </div>
    );

  /**
   * 🖥️ Render principal: resumen del curso + integración PayPal.
   */
  return (
    <main className={styles.checkoutWrapper}>
      {/* Panel superior con datos del curso */}
      <section className={styles.heroPanel}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => router.back()}
        >
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

      {/* Panel inferior: resumen + métodos de pago */}
      <section className={styles.checkoutGrid}>
        {/* 💼 Resumen del pedido */}
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

        {/* 💳 Métodos de pago */}
        <div className={styles.paymentCard}>
          <div className={styles.paymentHeader}>
            <p className={styles.sectionTitle}>Métodos disponibles</p>
            <p>Selecciona una pasarela para completar tu compra.</p>
          </div>

          {/* Selector visual de pasarelas */}
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

          {/* Integración PayPal */}
          {selectedMethod === "paypal" ? (
            <div className={styles.paypalContainer}>
              {useTestGateway && (
                <p className={styles.testModeBadge}>{testModeDescription}</p>
              )}
              {useNextMocks || useBackendMocks || isPayPalConfigured ? (
                useNextMocks || useBackendMocks ? (
                  <div className={styles.paypalInner}>
                    <p className={styles.mockDescription}>
                      {useNextMocks
                        ? "Esta simulación se ejecuta al 100% en el frontend, sin tocar PayPal ni el backend."
                        : "Esta simulación llama a /payments/mock/* en tu backend, pero sin abrir PayPal."}
                    </p>
                    <button
                      type="button"
                      className={styles.mockButton}
                      onClick={handleSimulatedPayment}
                      disabled={isProcessing}
                    >
                      {isProcessing
                        ? "Simulando…"
                        : useNextMocks
                          ? "Simular pago (frontend)"
                          : "Simular pago (backend)"}
                    </button>
                    <p className={styles.paypalStatus}>
                      {statusMessage ??
                        (useNextMocks
                          ? "Generaremos una orden ficticia y completaremos la compra."
                          : "Crearemos la orden mock en tu backend y la marcaremos como completada.")}
                    </p>
                    {isProcessing && (
                      <div className={styles.processingOverlay}>
                        <span className={styles.processingSpinner} />
                        <span>Procesando…</span>
                      </div>
                    )}
                  </div>
                ) : (
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
                          setStatusMessage(
                            "Cancelaste el pago. Puedes intentarlo de nuevo."
                          );
                        }}
                        onError={(err) => {
                          console.error("❌ Error en el pago:", err);
                          setStatusMessage(
                            "Hubo un problema con PayPal. Inténtalo nuevamente."
                          );
                          setIsProcessing(false);
                        }}
                        disabled={!isPayPalConfigured || isProcessing}
                      />
                      <p className={styles.paypalStatus}>
                        {statusMessage ??
                          "Serás redirigido a PayPal para finalizar tu compra."}
                      </p>

                      {isProcessing && (
                        <div className={styles.processingOverlay}>
                          <span className={styles.processingSpinner} />
                          <span>Procesando…</span>
                        </div>
                      )}
                    </div>
                  </PayPalScriptProvider>
                )
              ) : (
                <div className={styles.paypalWarning}>
                  <strong>PayPal no está configurado.</strong>
                  <p>
                    Define <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> en tu
                    archivo <code>.env</code> y recarga la página.
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

          {/* Footer legal + garantías */}
          <p className={styles.legalDisclaimer}>
            Al continuar aceptas nuestros términos de servicio. Los pagos no son
            reembolsables.
          </p>
          <div className={styles.guaranteeList}>
            {guarantees.map((item) => (
              <div key={item}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
