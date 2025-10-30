import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './entities/purchases.entity';

/**
 * Repositorio responsable de manejar las operaciones de acceso a datos
 * relacionadas con las compras (`Purchase`) en la base de datos.
 *
 * Esta clase encapsula toda la interacción con TypeORM y proporciona
 * métodos específicos para crear y consultar compras.
 *
 * Forma parte del patrón **Repository**, sirviendo como capa de persistencia
 * independiente de la lógica de negocio.
 */
@Injectable()
export class PurchasesRepository {
  /**
   * Inyecta el repositorio de TypeORM para la entidad `Purchase`.
   *
   * @param repo - Instancia de `Repository<Purchase>` proporcionada por TypeORM.
   */
  constructor(
    @InjectRepository(Purchase)
    private readonly repo: Repository<Purchase>,
  ) {}

  /**
   * Crea y guarda una nueva compra en la base de datos.
   *
   * Este método no valida si el usuario ya posee el curso; esa lógica
   * debe manejarse en la capa de servicio (`PurchasesService`).
   *
   * @param userId - ID del usuario que realiza la compra.
   * @param courseId - ID del curso que se desea comprar.
   * @returns La entidad `Purchase` recién creada y guardada.
   *
   * @example
   * ```ts
   * const nuevaCompra = await purchasesRepository.createPurchase(5, 10);
   * console.log(nuevaCompra.id); // ID autogenerado de la compra
   * ```
   */
  async createPurchase(userId: number, courseId: number): Promise<Purchase> {
    // Crea una nueva instancia de la entidad asociando el usuario y el curso por ID.
    const purchase = this.repo.create({
      user: { id: userId } as any,
      course: { id: courseId } as any,
    });

    // Persiste la nueva compra en la base de datos.
    return this.repo.save(purchase);
  }

  /**
   * Busca una compra existente para un usuario y curso específicos.
   *
   * Este método se utiliza para verificar si un usuario ya ha adquirido
   * un determinado curso antes de registrar una nueva compra.
   *
   * @param userId - ID del usuario.
   * @param courseId - ID del curso.
   * @returns La entidad `Purchase` si existe, o `null` si no se encontró ninguna.
   *
   * @example
   * ```ts
   * const compraExistente = await purchasesRepository.findUserPurchase(5, 10);
   * if (compraExistente) {
   *   console.log('El usuario ya compró este curso');
   * }
   * ```
   */
  async findUserPurchase(userId: number, courseId: number): Promise<Purchase | null> {
    return this.repo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
  }
}
