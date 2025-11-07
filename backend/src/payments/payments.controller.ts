import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PurchasesService } from 'src/purchases/purchases.service'; // ✅ importa el servicio de compras
import { RequestUser } from 'src/types/request';
import type { Request } from 'express';

/**
 * Controlador HTTP que expone los endpoints relacionados con pagos.
 * Se comunica con el servicio `PaymentsService` para interactuar con PayPal
 * y con `PurchasesService` para registrar las compras en la base de datos.
 */
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly purchasesService: PurchasesService, // ✅ inyectar servicio de compras
  ) {}

  private ensureMockAccess() {
    const allowMocks =
      process.env.NODE_ENV !== 'production' ||
      process.env.ALLOW_PAYMENT_MOCKS === 'true';

    if (!allowMocks) {
      throw new BadRequestException(
        'Los endpoints de prueba están deshabilitados en producción.',
      );
    }
  }

  /**
   * 📦 Crea una orden de PayPal (se ejecuta cuando el usuario inicia el pago)
   * Devuelve el `orderId` y los `links` que PayPal genera.
   */
  @Post('create-order')
  async createOrder(
    @Body('total') total: string,
    @Body('currency') currency?: string,
  ) {
    if (!total)
      throw new BadRequestException('El campo "total" es obligatorio');

    const order = await this.paymentsService.createOrder(
      total,
      currency || 'EUR',
    );
    return {
      id: order.id,
      status: order.status,
      links: order.links,
    };
  }

  /**
   * 🧪 Endpoint de prueba: crea una orden falsa sin llamar a PayPal.
   */
  @Post('mock/create-order')
  createMockOrder(
    @Body('total') total: string,
    @Body('currency') currency?: string,
    @Body('courseId') courseId?: number,
    @Req() req?: Request,
  ) {
    this.ensureMockAccess();
    if (!total)
      throw new BadRequestException('El campo "total" es obligatorio');

    const userId = (req?.user as RequestUser)?.id || 1;
    return this.paymentsService.createMockOrder(total, currency || 'EUR', {
      userId,
      courseId,
    });
  }

  /**
   * 💳 Captura la orden y registra la compra en la BD.
   */
  @Post('capture-order')
  async captureOrder(
    @Body('orderId') orderId: string,
    @Body('courseId') courseId: number,
    @Req() req: Request,
  ) {
    if (!orderId)
      throw new BadRequestException('El campo "orderId" es obligatorio');
    if (!courseId)
      throw new BadRequestException('El campo "courseId" es obligatorio');

    // 1️⃣ Capturar el pago en PayPal
    const capture = await this.paymentsService.captureOrder(orderId);

    // 2️⃣ Validar que el pago se completó correctamente
    if (capture.status === 'COMPLETED') {
      const user = req.user as RequestUser;
      const userId = user?.id;

      if (!userId)
        throw new BadRequestException(
          'No se pudo obtener el usuario autenticado.',
        );

      // 3️⃣ Registrar la compra
      await this.purchasesService.registerExternalPurchase({
        userId,
        courseId,
        paypalOrderId: capture.id,
        amount:
          capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ||
          0,
        status: 'COMPLETED',
        provider: 'paypal',
      });

      return { message: 'Compra registrada correctamente ✅', capture };
    }

    return { message: 'Pago no completado ❌', capture };
  }

  /**
   * 🧪 Endpoint de prueba: simula la captura sin registrar compra.
   */
  @Post('mock/capture-order')
  async captureMockOrder(
    @Body('orderId') orderId: string,
    @Body('courseId') courseId?: number,
    @Body('amount') amount?: number,
    @Body('userId') overrideUserId?: number,
    @Req() req?: Request,
  ) {
    this.ensureMockAccess();
    if (!orderId)
      throw new BadRequestException('El campo "orderId" es obligatorio');

    const user = req?.user as RequestUser;
    const userId = overrideUserId ?? user?.id ?? 1;

    const capture = this.paymentsService.captureMockOrder(orderId, {
      courseId,
      userId,
      amount,
    });

    if (capture.status === 'COMPLETED' && courseId && userId) {
      const paidAmount = amount ?? 0;
      await this.purchasesService.registerExternalPurchase({
        userId,
        courseId,
        paypalOrderId: capture.id,
        amount: paidAmount,
        status: 'COMPLETED',
        provider: 'paypal-mock',
      });
    }

    return capture;
  }
}
