import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
} from '@nestjs/common';
import * as path from 'path';
import { PaymentsService } from './payments.service';
import { PurchasesService } from 'src/purchases/purchases.service';
import { InvoicesService } from 'src/invoices/invoices.service';
import { RequestUser } from 'src/types/request';
import type { Request } from 'express';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

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
    private readonly usersService: UsersService,
  ) { }

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
    const normalizedTotal = this.normalizeAmount(total);
    const normalizedCurrency = this.normalizeCurrency(currency);

    const order = await this.paymentsService.createOrder(
      normalizedTotal,
      normalizedCurrency,
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
    const normalizedTotal = this.normalizeAmount(total);
    const normalizedCurrency = this.normalizeCurrency(currency);

    const userId = (req?.user as RequestUser).id;
    return this.paymentsService.createMockOrder(
      normalizedTotal,
      normalizedCurrency,
      {
        userId,
        courseId,
      },
    );
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
    if (!orderId?.trim())
      throw new BadRequestException('El campo "orderId" es obligatorio');
    const normalizedCourseId = this.ensurePositiveNumber(
      courseId,
      'courseId',
    );

    // 1️⃣ Capturar el pago en PayPal
    const capture = await this.paymentsService.captureOrder(orderId.trim());

    // 2️⃣ Verificar estado del pago
    if (capture.status === 'COMPLETED') {
      const sessionUser = req.user as RequestUser;
      const userId = sessionUser.id;

      if (!userId)
        throw new BadRequestException(
          'No se pudo obtener el usuario autenticado.',
        );

      // 3️⃣ Registrar la compra en la base de datos
      const paidAmount = this.extractPaidAmount(capture);

      const purchase = await this.purchasesService.registerExternalPurchase({
        userId,
        courseId: normalizedCourseId,
        paypalOrderId: capture.id,
        amount: paidAmount,
        status: 'COMPLETED',
        provider: 'paypal',
      });

      // 4️⃣ Generar factura PDF
      const course = await this.purchasesService.getCourseDetails(
        normalizedCourseId,
      );
      if (!course)
        throw new BadRequestException('No se encontró el curso solicitado.');

      const freshUser = await this.getFreshUserSnapshot(userId);

      const invoice = await this.invoicesService.generateInvoice({
        user: {
          id: userId,
          name: this.buildUserFullName(freshUser),
          email: freshUser.email,
        },
        course: {
          id: normalizedCourseId,
          title: course.title,
          price: Number(course.price),
        },
        purchase: {
          id: purchase.id,
          amount: Number(purchase.amount ?? paidAmount),
          createdAt: purchase.createdAt,
        },
      });

      // 5️⃣ Enviar factura por email y marcarla como enviada
      const absolutePdfPath = this.resolveInvoicePath(invoice.pdfPath);
      await this.mailService.sendInvoiceEmail(freshUser.email, absolutePdfPath);
      await this.invoicesService.markInvoiceAsEmailed(invoice.id);

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
    const userId = overrideUserId ?? user?.id;

    if (!userId) {
      throw new BadRequestException(
        'No se pudo obtener el usuario autenticado. Debes iniciar sesión para registrar la compra.',
      );
    }
    if (!courseId) {
      throw new BadRequestException(
        'Debes proporcionar el "courseId" para emitir la factura de prueba.',
      );
    }
    const normalizedCourseId = this.ensurePositiveNumber(
      courseId,
      'courseId',
    );

    const capture = this.paymentsService.captureMockOrder(orderId, {
      courseId: normalizedCourseId,
      userId,
      amount,
    });

    if (capture.status === 'COMPLETED' && userId) {
      const course = await this.purchasesService.getCourseDetails(
        normalizedCourseId,
      );
      const paidAmount =
        typeof amount === 'number' ? amount : Number(course.price);
      const freshUser = await this.getFreshUserSnapshot(userId);
      const purchase = await this.purchasesService.registerExternalPurchase({
        userId,
        courseId: normalizedCourseId,
        paypalOrderId: capture.id,
        amount: paidAmount,
        status: 'COMPLETED',
        provider: 'paypal-mock',
      });

      // Generar y enviar factura con datos reales
      const invoice = await this.invoicesService.generateInvoice({
        user: {
          id: userId,
          name: this.buildUserFullName(freshUser),
          email: freshUser.email,
        },
        course: {
          id: normalizedCourseId,
          title: course.title,
          price: Number(course.price),
        },
        purchase: {
          id: purchase.id,
          amount: Number(purchase.amount ?? paidAmount),
          createdAt: purchase.createdAt,
        },
      });

      const absolutePdfPath = this.resolveInvoicePath(invoice.pdfPath);
      await this.mailService.sendInvoiceEmail(freshUser.email, absolutePdfPath);
      await this.invoicesService.markInvoiceAsEmailed(invoice.id);
    }

    return capture;
  }

  private normalizeAmount(amount?: string) {
    if (!amount?.trim())
      throw new BadRequestException('El campo "total" es obligatorio');

    const normalized = amount.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      throw new BadRequestException(
        'El importe debe tener formato numérico (ej: 9.99).',
      );
    }
    return normalized;
  }

  private normalizeCurrency(currency?: string) {
    if (!currency) return 'EUR';
    const normalized = currency.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalized)) {
      throw new BadRequestException('El código de moneda debe tener 3 letras.');
    }
    return normalized;
  }

  private ensurePositiveNumber(
    value: number | string | undefined,
    field: string,
  ) {
    const parsed = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(parsed) || parsed! <= 0) {
      throw new BadRequestException(
        `El campo "${field}" debe ser un número positivo.`,
      );
    }
    return parsed!;
  }

  private extractPaidAmount(capture: any) {
    const rawValue =
      capture?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
    const amount =
      typeof rawValue === 'string' ? Number(rawValue) : rawValue ?? 0;

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException(
        'No se pudo determinar el importe capturado en PayPal.',
      );
    }

    return amount;
  }

  private async getFreshUserSnapshot(userId: number): Promise<User> {
    const user = await this.usersService.findOne(userId);
    if (!user.email?.trim()) {
      throw new BadRequestException(
        'El usuario no tiene un email definido para enviar la factura.',
      );
    }
    return user;
  }

  private buildUserFullName(user: Pick<User, 'name' | 'second_name'>) {
    const parts = [user.name, user.second_name]
      .map((part) => part?.trim())
      .filter(Boolean);
    if (parts.length === 0) {
      return 'Cliente Combat Strike';
    }
    return parts.join(' ');
  }

  private resolveInvoicePath(pdfPath: string) {
    return path.isAbsolute(pdfPath)
      ? pdfPath
      : path.join(process.cwd(), pdfPath);
  }
}
