import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './entities/purchases.entity';

/**
 * Repositorio responsable de manejar las operaciones de acceso a datos
 * relacionadas con las compras (`Purchase`) en la base de datos.
 *
 * Implementa el patrón **Repository**, proporcionando una capa de
 * persistencia desacoplada de la lógica de negocio.
 */
@Injectable()
export class PurchasesRepository {
  /**
   * Inyecta el repositorio de TypeORM para la entidad `Purchase`.
   */
  constructor(
    @InjectRepository(Purchase)
    private readonly repo: Repository<Purchase>,
  ) {}

  /**
   * 💳 Crea una compra básica entre un usuario y un curso (sin pasarela externa).
   *
   * @param userId - ID del usuario que realiza la compra.
   * @param courseId - ID del curso comprado.
   * @returns La compra recién creada.
   *
   * @example
   * ```ts
   * await purchasesRepository.createBasicPurchase(1, 42);
   * ```
   */
  async createBasicPurchase(userId: number, courseId: number): Promise<Purchase> {
    const purchase = this.repo.create({
      user: { id: userId } as any,
      course: { id: courseId } as any,
      provider: 'manual',
      status: 'COMPLETED',
    });

    return this.repo.save(purchase);
  }

  /**
   * 🧾 Crea una compra con información de pasarela de pago (PayPal, Revolut, etc.)
   *
   * @param data - Datos de la compra provenientes de la pasarela.
   * @returns La entidad `Purchase` creada y guardada.
   *
   * @example
   * ```ts
   * await purchasesRepository.createExternalPurchase({
   *   userId: 12,
   *   courseId: 3,
   *   externalOrderId: 'PAYPAL_ORDER_1234',
   *   amount: 59.99,
   *   status: 'COMPLETED',
   *   provider: 'paypal'
   * });
   * ```
   */
  async createExternalPurchase(data: {
    userId: number;
    courseId: number;
    externalOrderId: string;
    amount: number;
    status: string;
    provider: string;
  }): Promise<Purchase> {
    const purchase = this.repo.create({
      user: { id: data.userId } as any,
      course: { id: data.courseId } as any,
      externalOrderId: data.externalOrderId,
      amount: data.amount,
      status: data.status,
      provider: data.provider,
    });

    return this.repo.save(purchase);
  }

  /**
   * 🔍 Busca una compra existente para un usuario y curso específicos.
   *
   * Útil para evitar compras duplicadas.
   *
   * @param userId - ID del usuario.
   * @param courseId - ID del curso.
   * @returns La compra si existe, o `null` si no se encontró ninguna.
   */
  async findUserPurchase(userId: number, courseId: number): Promise<Purchase | null> {
    return this.repo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
  }

  /**
   * 💾 Guarda una instancia de `Purchase` en la base de datos.
   * Permite usar este repositorio con objetos previamente construidos.
   */
  async save(purchase: Purchase): Promise<Purchase> {
    return this.repo.save(purchase);
  }
}
