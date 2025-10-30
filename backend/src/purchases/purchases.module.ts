import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesRepository } from './purchases.repository';
import { PurchasesService } from './purchases.service';
import { Purchase } from './entities/purchases.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase])],
  providers: [PurchasesRepository, PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
