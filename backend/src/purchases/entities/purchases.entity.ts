import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/auth/entities/user.entity';

/**
 * Entidad que representa una compra de curso dentro del sistema.
 *
 * Cada registro en esta tabla indica que un usuario ha adquirido un curso determinado.
 * 
 * 🔹 Relaciones:
 * - Un usuario puede tener muchas compras.
 * - Un curso puede ser comprado por muchos usuarios.
 * 
 * Por tanto, esta entidad actúa como una **tabla intermedia (many-to-many implícita)**
 * entre `User` y `Course`, pero con su propia información adicional (fecha de compra).
 */
@Entity('purchases')
export class Purchase {
  /**
   * Identificador único de la compra.
   *
   * Se genera automáticamente usando un UUID (un identificador global único).
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Relación con el usuario que realizó la compra.
   *
   * - `ManyToOne`: muchos registros de `Purchase` pueden pertenecer al mismo `User`.
   * - `onDelete: 'CASCADE'`: si el usuario es eliminado, también se borran sus compras.
   *
   * La columna en la base de datos se llamará `user_id`.
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /**
   * Relación con el curso comprado.
   *
   * - `ManyToOne`: muchos registros de `Purchase` pueden referirse al mismo `Course`.
   * - `onDelete: 'CASCADE'`: si el curso es eliminado, también se eliminan las compras asociadas.
   *
   * La columna en la base de datos se llamará `course_id`.
   */
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  /**
   * Fecha y hora exacta en la que se registró la compra.
   *
   * `@CreateDateColumn` hace que TypeORM asigne automáticamente
   * la fecha actual (`CURRENT_TIMESTAMP`) al crear el registro.
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
