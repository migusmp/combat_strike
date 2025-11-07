import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';

/**
 * Controlador HTTP que expone los endpoints relacionados con pagos.
 * Se comunica con el servicio `PaymentsService` para interactuar con PayPal.
 */
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * 📦 Crea una orden de PayPal (se ejecuta cuando el usuario inicia el pago)
   * Devuelve el `orderId` y los `links` que PayPal genera.
   */
  @Post('create-order')
  async createOrder(
    @Body('total') total: string,
    @Body('currency') currency?: string,
  ) {
    if (!total) throw new BadRequestException('El campo "total" es obligatorio');

    const order = await this.paymentsService.createOrder(total, currency || 'EUR');
    return {
      id: order.id,
      status: order.status,
      links: order.links,
    };
  }

  /**
   * 💳 Captura la orden una vez que el usuario ha aprobado el pago en PayPal.
   * Este endpoint completa la transacción y puede registrar la compra en tu BD.
   */
  @Post('capture-order')
  async captureOrder(@Body('orderId') orderId: string) {
    if (!orderId)
      throw new BadRequestException('El campo "orderId" es obligatorio');

    const capture = await this.paymentsService.captureOrder(orderId);
    return capture;
  }
}
