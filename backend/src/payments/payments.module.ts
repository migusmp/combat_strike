import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PurchasesModule } from 'src/purchases/purchases.module';

@Module({
  imports: [PurchasesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService], // útil si luego lo usas en otros módulos
})
export class PaymentsModule {}
