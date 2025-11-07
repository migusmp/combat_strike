import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesRepository } from './purchases.repository';
import { PurchasesService } from './purchases.service';
import { Purchase } from './entities/purchases.entity';
import { Course } from 'src/courses/entities/course.entity';
import { CoursesModule } from 'src/courses/courses.module';

/**
 * Módulo que agrupa toda la funcionalidad relacionada con las compras de cursos.
 *
 * Este módulo encapsula la capa de datos (repositorio), la capa de negocio (servicio)
 * y la entidad `Purchase`, garantizando que la lógica de compras esté aislada y organizada.
 *
 * 🔹 Contiene:
 * - La entidad `Purchase` (modelo de base de datos)
 * - El repositorio `PurchasesRepository` (acceso a datos)
 * - El servicio `PurchasesService` (lógica de negocio)
 *
 * 🔹 Exporta:
 * - `PurchasesService`, para que otros módulos (como `CoursesModule` o `AuthModule`)
 *   puedan usar la lógica de compras sin conocer la implementación interna.
 */
@Module({
  /**
   * Importa el módulo de TypeORM configurado con la entidad `Purchase`,
   * permitiendo a NestJS inyectar automáticamente el repositorio
   * de TypeORM dentro de `PurchasesRepository`.
   */
  imports: [
    TypeOrmModule.forFeature([Purchase, Course]),
    forwardRef(() => CoursesModule),
  ],

  /**
   * Define los proveedores que estarán disponibles dentro de este módulo:
   * - `PurchasesRepository`: gestiona las operaciones con la base de datos.
   * - `PurchasesService`: contiene la lógica de negocio sobre las compras.
   */
  providers: [PurchasesRepository, PurchasesService],

  /**
   * Exporta el servicio de compras para que pueda ser utilizado
   * en otros módulos de la aplicación (por ejemplo, en `CoursesController`).
   */
  exports: [PurchasesService],
})
export class PurchasesModule {}
