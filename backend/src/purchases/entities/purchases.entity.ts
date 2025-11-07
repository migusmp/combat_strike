import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
  JoinColumn,
} from 'typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';

/**
 * Entidad que representa una compra de curso dentro del sistema.
 *
 * Cada registro indica que un usuario ha adquirido un curso determinado.
 *
 * 🔹 Relaciones:
 * - Un usuario puede tener muchas compras.
 * - Un curso puede ser comprado por muchos usuarios.
 *
 * Incluye campos adicionales para registrar transacciones
 * provenientes de pasarelas externas como PayPal o Revolut.
 */
@Entity('purchases')
export class Purchase {
  /**
   * Identificador único de la compra.
   *
   * Se genera automáticamente usando un UUID.
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Relación con el usuario que realizó la compra.
   *
   * - `ManyToOne`: muchos registros pueden pertenecer al mismo usuario.
   * - `onDelete: 'CASCADE'`: si el usuario es eliminado, se borran sus compras.
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /**
   * Relación con el curso comprado.
   *
   * - `ManyToOne`: muchos registros pueden referirse al mismo curso.
   * - `onDelete: 'CASCADE'`: si el curso se elimina, se borran las compras asociadas.
   */
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  /**
   * ID de la orden en la pasarela de pago (PayPal, Revolut, etc.)
   * Ejemplo: "8P12345678901234K"
   */
  @Column({ name: 'external_order_id', nullable: true })
  externalOrderId?: string;

  /**
   * Monto total pagado por el usuario.
   *
   * Ejemplo: 59.99 (decimal con 2 dígitos)
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount?: number;

  /**
   * Estado de la compra (ej: COMPLETED, PENDING, FAILED).
   */
  @Column({ default: 'COMPLETED' })
  status!: string;

  /**
   * Nombre del proveedor de pago (ej: paypal, revolut, stripe).
   */
  @Column({ default: 'manual' })
  provider!: string;

  /**
   * Fecha y hora en la que se registró la compra.
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
