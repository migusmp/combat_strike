import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './entities/purchases.entity';

@Injectable()
export class PurchasesRepository {
  constructor(
    @InjectRepository(Purchase)
    private readonly repo: Repository<Purchase>,
  ) {}

  async createPurchase(userId: number, courseId: number): Promise<Purchase> {
    const purchase = this.repo.create({
      user: { id: userId } as any,
      course: { id: courseId } as any,
    });
    return this.repo.save(purchase);
  }

  async findUserPurchase(userId: number, courseId: number): Promise<Purchase | null> {
    return this.repo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
  }
}
