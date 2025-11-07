import { Injectable, NotFoundException } from '@nestjs/common';
import { PurchasesRepository } from './purchases.repository';
import { Purchase } from './entities/purchases.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { Repository } from 'typeorm';

/**
 * Servicio encargado de manejar toda la lógica relacionada con las compras de cursos.
 *
 * Este servicio centraliza las operaciones de negocio sobre las compras,
 * sirviendo como intermediario entre los controladores y el repositorio.
 */
@Injectable()
export class PurchasesService {
  constructor(
    private readonly purchasesRepo: PurchasesRepository,
    // 👇 Inyectamos el repositorio de cursos para obtener detalles al generar facturas
    @InjectRepository(Course)
    private readonly coursesRepo: Repository<Course>,
  ) {}

  /**
   * Verifica si un usuario ya ha comprado un curso específico.
   *
   * @param userId - ID del usuario que se desea comprobar.
   * @param courseId - ID del curso a verificar.
   * @returns `true` si el usuario ya ha comprado el curso, `false` en caso contrario.
   */
  async hasUserPurchasedCourse(
    userId: number,
    courseId: number,
  ): Promise<boolean> {
    const purchase = await this.purchasesRepo.findUserPurchase(
      userId,
      courseId,
    );
    return !!purchase;
  }

  /**
   * 🧾 Registra una nueva compra local (sin pasarela de pago).
   *
   * Este método se usa en modo de pruebas o desde el panel administrativo.
   * Si en el futuro agregas Stripe, Revolut o cupones, esta función puede
   * seguir siendo útil para registrar compras manuales o gratuitas.
   *
   * @param userId - ID del usuario que realiza la compra.
   * @param courseId - ID del curso que se está comprando.
   * @returns El objeto `Purchase` recién creado.
   */
  async registerPurchase(userId: number, courseId: number): Promise<Purchase> {
    // 🔹 Se cambió createPurchase → createBasicPurchase
    return this.purchasesRepo.createBasicPurchase(userId, courseId);
  }

  /**
   * 💳 Registra una compra proveniente de PayPal (o cualquier otro proveedor externo).
   *
   * Este método se llama normalmente después de confirmar un pago con éxito.
   * Permite guardar información adicional del pago (orderId, importe, estado, proveedor...).
   */
  async registerExternalPurchase(data: {
    userId: number;
    courseId: number;
    paypalOrderId: string;
    amount: number;
    status: string;
    provider: string;
  }): Promise<Purchase> {
    return this.purchasesRepo.createExternalPurchase({
      userId: data.userId,
      courseId: data.courseId,
      externalOrderId: data.paypalOrderId,
      amount: data.amount,
      status: data.status,
      provider: data.provider,
    });
  }
  /**
   * 📘 Obtiene la información básica de un curso para generar facturas.
   *
   * Este método busca el curso por su ID y devuelve solo los datos esenciales
   * (título y precio) para no sobrecargar la respuesta.
   *
   * @param courseId - ID del curso que se desea consultar.
   * @returns Un objeto con `title` y `price` del curso.
   *
   * @throws `NotFoundException` si el curso no existe.
   *
   * @example
   * ```ts
   * const course = await purchasesService.getCourseDetails(5);
   * console.log(course.title); // "Krav Maga: Defensa Personal Intensiva"
   * ```
   */
  async getCourseDetails(
    courseId: number,
  ): Promise<{ title: string; price: number }> {
    const course = await this.coursesRepo.findOne({
      where: { id: courseId },
      select: ['title', 'price'],
    });

    if (!course) {
      throw new NotFoundException(`No se encontró el curso con ID ${courseId}`);
    }

    return {
      title: course.title,
      price: Number(course.price),
    };
  }
}
