import { Injectable } from '@nestjs/common';
import { PurchasesRepository } from './purchases.repository';
import { Purchase } from './entities/purchases.entity';

@Injectable()
export class PurchasesService {
  constructor(private readonly purchasesRepo: PurchasesRepository) {}

  async hasUserPurchasedCourse(userId: number, courseId: number): Promise<boolean> {
    const purchase = await this.purchasesRepo.findUserPurchase(userId, courseId);
    return !!purchase;
  }

  async registerPurchase(userId: number, courseId: number): Promise<Purchase> {
    return this.purchasesRepo.createPurchase(userId, courseId);
  }
}
