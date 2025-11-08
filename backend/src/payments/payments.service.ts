import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  OrdersController,
} from '@paypal/paypal-server-sdk';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  // 🔹 Cliente principal que maneja las credenciales y el entorno (sandbox/live)
  private client: Client;

  // 🔹 Controlador de órdenes que permite crear y capturar pagos
  private orders: OrdersController;

  constructor() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.logger.error(
        'PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no están definidos.',
      );
      throw new Error(
        'Credenciales de PayPal no configuradas. Revisa tus variables de entorno.',
      );
    }

    /**
     * Inicializa el cliente PayPal con tus credenciales.
     * PayPal usa OAuth2 internamente, así que el SDK se encarga
     * de gestionar los tokens automáticamente en cada llamada.
     */
    this.client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId, // ID de cliente PayPal
        oAuthClientSecret: clientSecret, // Secreto de cliente PayPal
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
    try {
      // Llamada a la API de PayPal para crear una orden
      const response = await this.orders.createOrder({
        body: {
          intent: CheckoutPaymentIntent.Capture, // ✅ modo "captura" (no solo autorización)

          // ✅ Lista de unidades de compra (puedes incluir más datos como descripción, items, etc.)
          purchaseUnits: [
            {
              amount: {
                currencyCode: currency, // 🪙 Código de moneda (ej: "EUR" o "USD")
                value: total, // 💰 Monto total
              },
            },
          ],
        },
      });

      // La respuesta viene como string, así que la convertimos a JSON
      return this.safeParseResponse(response.body);
    } catch (error) {
      this.logger.error(
        'Error creando orden de PayPal',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'No se pudo crear la orden de pago. Inténtalo más tarde.',
      );
    }
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
    try {
      // Llamada a PayPal para capturar (finalizar) el pago
      const response = await this.orders.captureOrder({
        id: orderId,
        body: {}, // Requerido por el SDK, aunque esté vacío
      });

      // Parseamos el resultado (string -> objeto)
      return this.safeParseResponse(response.body);
    } catch (error) {
      this.logger.error(
        `Error capturando orden de PayPal ${orderId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'No se pudo capturar la orden. Verifica el pago.',
      );
    }
  }

  private safeParseResponse(body: unknown): Record<string, any> {
    if (body && typeof body === 'object' && !this.isBufferLike(body)) {
      return body as Record<string, any>;
    }

    const serialized = this.serializeBody(body);

    try {
      return JSON.parse(serialized);
    } catch (error) {
      this.logger.error(
        'Respuesta de PayPal inválida',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Respuesta inesperada del proveedor de pagos.',
      );
    }
  }

  private serializeBody(body: unknown) {
    if (typeof body === 'string') return body;
    if (typeof body === 'number') return body.toString();
    if (body instanceof ArrayBuffer)
      return Buffer.from(body).toString('utf-8');
    if (body && typeof Buffer !== 'undefined' && Buffer.isBuffer(body))
      return body.toString('utf-8');
    if (
      body &&
      typeof (body as NodeJS.ReadableStream)?.read === 'function'
    ) {
      throw new InternalServerErrorException(
        'El proveedor devolvió un flujo no soportado.',
      );
    }
    return JSON.stringify(body ?? {});
  }

  private isBufferLike(value: unknown) {
    return (
      value instanceof ArrayBuffer ||
      (typeof Buffer !== 'undefined' && Buffer.isBuffer(value))
    );
  }

  /**
   * 🧪 Genera una orden falsa para pruebas locales sin contactar con PayPal.
   */
  createMockOrder(
    total: string,
    currency = 'EUR',
    context?: { userId?: number; courseId?: number },
  ) {
    const mockOrderId = `TEST-${Math.random()
      .toString(36)
      .slice(2, 10)
      .toUpperCase()}`;

    return {
      id: mockOrderId,
      status: 'CREATED',
      intent: 'CAPTURE',
      test: true,
      amount: {
        value: total,
        currency_code: currency,
      },
      links: [],
      createdAt: new Date().toISOString(),
      message: 'Orden simulada. Cambia a entorno real para contactar con PayPal.',
      metadata: context,
    };
  }

  /**
   * 🧪 Simula la captura de una orden para pruebas sin PayPal.
   */
  captureMockOrder(
    orderId: string,
    data: { courseId?: number; userId?: number; amount?: number },
  ) {
    return {
      id: orderId,
      status: 'COMPLETED',
      test: true,
      ...data,
      captureTime: new Date().toISOString(),
      message: 'Captura simulada correctamente.',
    };
  }
}
