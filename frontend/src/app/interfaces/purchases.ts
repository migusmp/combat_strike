import { Course } from './courses';

/**
 * Representa una compra realizada por el usuario autenticado.
 */
export interface PurchasedCourse {
  /** Identificador de la compra (UUID). */
  purchaseId: string;
  /** Fecha de la compra en formato ISO. */
  purchasedAt: string;
  /** Proveedor de pago (paypal, manual, etc.). */
  provider: string;
  /** Estado actual de la compra (COMPLETED, PENDING...). */
  status: string;
  /** Monto abonado (puede ser null si no se registró). */
  amount: number | null;
  /** Identificador externo de la orden (PayPal, Revolut...). */
  externalOrderId: string | null;
  /** Curso asociado a la compra. */
  course?: Course;
}
