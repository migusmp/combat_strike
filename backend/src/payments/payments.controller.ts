import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PurchasesService } from 'src/purchases/purchases.service';
import { InvoicesService } from 'src/invoices/invoices.service';
import { RequestUser } from 'src/types/request';
import type { Request } from 'express';
import { MailService } from 'src/mail/mail.service';

/**
 * Controlador HTTP para gestionar los flujos de pago:
 * - Creación de órdenes (PayPal o mock)
 * - Captura del pago
 * - Registro de la compra en la BD
 * - Generación y envío de factura PDF
 */
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly purchasesService: PurchasesService,
    private readonly invoicesService: InvoicesService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Permite desactivar endpoints de prueba en producción.
   */
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
   * 📦 Crea una orden de PayPal.
   * Se ejecuta cuando el usuario inicia el flujo de pago desde el frontend.
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
   * 🧪 Crea una orden falsa para pruebas locales (sin PayPal real).
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
   * 💳 Captura la orden tras la aprobación del pago en PayPal.
   * Registra la compra en la BD, genera la factura y la envía por email.
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

    // 2️⃣ Verificar estado del pago
    if (capture.status === 'COMPLETED') {
      const user = req.user as RequestUser;
      const userId = user?.id;

      if (!userId)
        throw new BadRequestException(
          'No se pudo obtener el usuario autenticado.',
        );

      // 3️⃣ Registrar la compra en la base de datos
      const paidAmount =
        Number(
          capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ??
            0,
        ) || 0;

      const purchase = await this.purchasesService.registerExternalPurchase({
        userId,
        courseId,
        paypalOrderId: capture.id,
        amount: paidAmount,
        status: 'COMPLETED',
        provider: 'paypal',
      });

      // 4️⃣ Generar factura PDF
      const course = await this.purchasesService.getCourseDetails(courseId);
      const pdfPath = await this.invoicesService.generateInvoice({
        user: { name: user.name, email: user.email },
        course: { title: course.title, price: Number(course.price) },
        purchase: {
          id: purchase.id,
          amount: Number(purchase.amount ?? paidAmount),
          createdAt: purchase.createdAt,
        },
      });

      // 5️⃣ Enviar factura por email
      await this.mailService.sendInvoiceEmail(user.email, pdfPath);

      return {
        message: 'Compra registrada y factura enviada correctamente ✅',
        capture,
      };
    }

    // ❌ Si el pago no fue completado
    return { message: 'Pago no completado ❌', capture };
  }

  /**
   * 🧪 Captura mock (sin PayPal real, solo pruebas locales).
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
      const paidAmount = typeof amount === 'number' ? amount : 0;
      await this.purchasesService.registerExternalPurchase({
        userId,
        courseId,
        paypalOrderId: capture.id,
        amount: paidAmount,
        status: 'COMPLETED',
        provider: 'paypal-mock',
      });

      // También puedes generar y enviar factura de prueba
      const pdfPath = await this.invoicesService.generateInvoice({
        user: {
          name: user?.name ?? 'Usuario de prueba',
          email: user.email,
        },
        course: { title: 'Curso de prueba', price: paidAmount },
        purchase: {
          id: capture.id,
          amount: paidAmount,
          createdAt: new Date(),
        },
      });
      await this.mailService.sendInvoiceEmail(user.email, pdfPath);
    }

    return capture;
  }
}
