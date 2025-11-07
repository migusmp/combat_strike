import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PurchasesModule } from 'src/purchases/purchases.module';
import { InvoicesModule } from 'src/invoices/invoices.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [PurchasesModule, InvoicesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, MailService],
  exports: [PaymentsService], // útil si luego lo usas en otros módulos
})
export class PaymentsModule {}
