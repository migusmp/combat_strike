import { Injectable } from '@nestjs/common';
import { PurchasesRepository } from './purchases.repository';
import { Purchase } from './entities/purchases.entity';

/**
 * Servicio encargado de manejar toda la lógica relacionada con las compras de cursos.
 * 
 * Este servicio actúa como una capa intermedia entre los controladores y el repositorio,
 * centralizando la lógica de negocio para operaciones sobre las compras.
 */
@Injectable()
export class PurchasesService {
  /**
   * Inyecta el repositorio de compras para acceder a la base de datos.
   * 
   * @param purchasesRepo - Repositorio que gestiona las operaciones de persistencia de compras.
   */
  constructor(private readonly purchasesRepo: PurchasesRepository) {}

  /**
   * Verifica si un usuario ya ha comprado un curso específico.
   *
   * @param userId - ID del usuario que se desea comprobar.
   * @param courseId - ID del curso a verificar.
   * @returns `true` si el usuario ya ha comprado el curso, `false` en caso contrario.
   *
   * @example
   * ```ts
   * const yaComprado = await purchasesService.hasUserPurchasedCourse(1, 42);
   * if (yaComprado) {
   *   throw new ConflictException('El usuario ya posee este curso');
   * }
   * ```
   */
  async hasUserPurchasedCourse(userId: number, courseId: number): Promise<boolean> {
    const purchase = await this.purchasesRepo.findUserPurchase(userId, courseId);
    return !!purchase; // Devuelve true si existe una compra registrada
  }

  /**
   * Registra una nueva compra de curso para un usuario.
   *
   * @param userId - ID del usuario que realiza la compra.
   * @param courseId - ID del curso que se está comprando.
   * @returns El objeto `Purchase` recién creado.
   *
   * @example
   * ```ts
   * const compra = await purchasesService.registerPurchase(1, 42);
   * console.log(compra.id); // ID de la compra creada
   * ```
   */
  async registerPurchase(userId: number, courseId: number): Promise<Purchase> {
    return this.purchasesRepo.createPurchase(userId, courseId);
  }
}
