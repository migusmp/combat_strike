import { Injectable } from '@nestjs/common';
import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  OrdersController,
} from '@paypal/paypal-server-sdk';
import * as dotenv from 'dotenv';

// ✅ Carga las variables de entorno desde el archivo .env
// (donde tendrás PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET)
dotenv.config();

@Injectable()
export class PaymentsService {
  // 🔹 Cliente principal que maneja las credenciales y el entorno (sandbox/live)
  private client: Client;

  // 🔹 Controlador de órdenes que permite crear y capturar pagos
  private orders: OrdersController;

  constructor() {
    /**
     * Inicializa el cliente PayPal con tus credenciales.
     * PayPal usa OAuth2 internamente, así que el SDK se encarga
     * de gestionar los tokens automáticamente en cada llamada.
     */
    this.client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID!,     // ID de cliente PayPal
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!, // Secreto de cliente PayPal
      },

      // Determina si usamos entorno sandbox o producción según NODE_ENV
      environment:
        process.env.NODE_ENV === 'production'
          ? Environment.Production // 🟢 entorno real
          : Environment.Sandbox,   // 🧪 entorno de pruebas
    });

    // Crea un controlador de órdenes vinculado al cliente PayPal
    // Este objeto contiene los métodos para crear, capturar, etc.
    this.orders = new OrdersController(this.client);
  }

  /**
   * 🧾 Crea una orden de pago en PayPal
   * 
   * @param total    Monto total de la compra (ej: "59.99")
   * @param currency Moneda (por defecto EUR)
   * @returns        Objeto con los datos de la orden (id, links, estado, etc.)
   * 
   * Flujo:
   * 1. Genera una orden con intención de "CAPTURE" (capturar el pago directamente).
   * 2. PayPal devuelve un ID de orden y enlaces (uno de ellos es el de aprobación).
   * 3. El frontend usará ese ID para redirigir al usuario o mostrar el botón PayPal.
   */
  async createOrder(total: string, currency = 'EUR') {
    // Llamada a la API de PayPal para crear una orden
    const response = await this.orders.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture, // ✅ modo "captura" (no solo autorización)

        // ✅ Lista de unidades de compra (puedes incluir más datos como descripción, items, etc.)
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency, // 🪙 Código de moneda (ej: "EUR" o "USD")
              value: total,           // 💰 Monto total
            },
          },
        ],
      },
    });

    // La respuesta viene como string, así que la convertimos a JSON
    const order = JSON.parse(response.body as unknown as string);

    // Ejemplo de respuesta:
    // {
    //   id: "8P12345678901234K",
    //   status: "CREATED",
    //   links: [{ rel: "approve", href: "...", method: "GET" }]
    // }
    return order;
  }

  /**
   * 💳 Captura el pago de una orden existente
   * 
   * @param orderId ID de la orden creada previamente
   * @returns       Resultado completo de la captura (status, payer, etc.)
   * 
   * Flujo:
   * 1. El usuario aprueba la orden en el frontend (PayPal UI).
   * 2. El frontend obtiene el `orderId` y lo envía a este endpoint.
   * 3. Este método llama a la API de PayPal para ejecutar la transacción.
   */
  async captureOrder(orderId: string) {
    // Llamada a PayPal para capturar (finalizar) el pago
    const response = await this.orders.captureOrder({
      id: orderId,
      body: {}, // Requerido por el SDK, aunque esté vacío
    });

    // Parseamos el resultado (string -> objeto)
    const capture = JSON.parse(response.body as unknown as string);

    // Ejemplo de respuesta:
    // {
    //   id: "8P12345678901234K",
    //   status: "COMPLETED",
    //   purchase_units: [...],
    //   payer: { name, email_address }
    // }
    return capture;
  }
}