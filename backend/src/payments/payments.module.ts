import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PurchasesModule } from 'src/purchases/purchases.module';
import { InvoicesModule } from 'src/invoices/invoices.module';
import { MailService } from 'src/mail/mail.service';
import { AuthCookieMiddleware } from 'src/courses/auth-cookie.middleware';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [PurchasesModule, InvoicesModule, UsersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, MailService],
  exports: [PaymentsService],
})
export class PaymentsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthCookieMiddleware).forRoutes(
      // ✅ Pagos protegidos
      { path: 'payments/create-order', method: RequestMethod.POST },
      { path: 'payments/capture-order', method: RequestMethod.POST },
      { path: 'payments/mock/create-order', method: RequestMethod.POST },
      { path: 'payments/mock/capture-order', method: RequestMethod.POST },
    );
  }
}
