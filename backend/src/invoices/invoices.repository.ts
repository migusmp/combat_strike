import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Purchase } from 'src/purchases/entities/purchases.entity';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class InvoicesRepository {
  constructor(
    @InjectRepository(Invoice)
    private readonly repo: Repository<Invoice>,
  ) {}

  /**
   * Persists a new invoice linked to a purchase.
   */
  async createFromPurchase(data: {
    invoiceNumber: string;
    userId: number;
    courseId?: number;
    purchaseId: string;
    total: number;
    currency: string;
    pdfPath: string;
    issuedAt: Date;
    status?: string;
    emailedAt?: Date | null;
  }): Promise<Invoice> {
    const invoice = this.repo.create({
      invoiceNumber: data.invoiceNumber,
      user: { id: data.userId } as User,
      course: data.courseId ? ({ id: data.courseId } as Course) : null,
      purchase: { id: data.purchaseId } as Purchase,
      total: data.total,
      currency: data.currency,
      pdfPath: data.pdfPath,
      issuedAt: data.issuedAt,
      status: data.status ?? 'ISSUED',
      emailedAt: data.emailedAt ?? null,
    });

    return this.repo.save(invoice);
  }

  async markAsEmailed(id: string, sentAt = new Date()): Promise<void> {
    await this.repo.update({ id }, { emailedAt: sentAt });
  }
}
