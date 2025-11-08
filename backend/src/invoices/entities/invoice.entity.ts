import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Purchase } from 'src/purchases/entities/purchases.entity';

/**
 * Entidad que representa una factura emitida tras una compra exitosa.
 *
 * Cada factura queda vinculada a una única transacción de compra,
 * lo que permite mantener un registro financiero trazable y verificable.
 *
 * Esta entidad almacena la información esencial de la factura, incluyendo:
 *  - El usuario comprador.
 *  - El curso adquirido (si aplica).
 *  - El importe total y la divisa.
 *  - La ruta del archivo PDF generado.
 *  - Las fechas de emisión y envío por correo.
 */
@Entity('invoices')
export class Invoice {
  /**
   * Identificador único de la factura.
   * Se genera automáticamente en formato UUID.
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Número único de factura (por ejemplo, INV-2025-0001).
   * Facilita la referencia humana y el control contable.
   */
  @Column({ name: 'invoice_number', unique: true })
  invoiceNumber!: string;

  /**
   * Usuario asociado a la factura.
   *
   * - Relación de muchos a uno (ManyToOne): un usuario puede tener varias facturas.
   * - Si el usuario se elimina, todas sus facturas asociadas se eliminan también (`onDelete: 'CASCADE'`).
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /**
   * Curso vinculado a la factura.
   *
   * - Es opcional (`nullable: true`), ya que el curso podría ser eliminado posteriormente.
   * - En caso de eliminación del curso, el valor se establece en `NULL` (`onDelete: 'SET NULL'`).
   */
  @ManyToOne(() => Course, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'course_id' })
  course?: Course | null;

  /**
   * Relación directa con la compra que generó la factura.
   *
   * - Cada factura está asociada a una única compra (`OneToOne`).
   * - Si la compra se elimina, la factura también se elimina (`onDelete: 'CASCADE'`).
   * - Se crea un índice único para garantizar la correspondencia 1:1.
   */
  @OneToOne(() => Purchase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_id' })
  @Index({ unique: true })
  purchase!: Purchase;

  /**
   * Total de la factura.
   *
   * - Tipo decimal con precisión de 10 dígitos y 2 decimales.
   * - Representa el importe total de la transacción.
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  /**
   * Divisa en la que se emitió la factura.
   * Ejemplo: "EUR", "USD", "GBP".
   */
  @Column({ length: 3 })
  currency!: string;

  /**
   * Ruta del archivo PDF generado con la factura.
   * Generalmente apunta a una carpeta dentro del servidor (por ejemplo: `/invoices/pdf/...`).
   */
  @Column({ name: 'pdf_path' })
  pdfPath!: string;

  /**
   * Estado actual de la factura.
   * Valor por defecto: `'ISSUED'` (emitida).
   * Otros posibles estados: `'SENT'`, `'CANCELLED'`, `'PAID'`, etc.
   */
  @Column({ default: 'ISSUED' })
  status!: string;

  /**
   * Fecha y hora en la que la factura fue emitida.
   * Utiliza el tipo `timestamptz` (timestamp con zona horaria).
   */
  @Column({ name: 'issued_at', type: 'timestamptz' })
  issuedAt!: Date;

  /**
   * Fecha y hora en la que la factura fue enviada por correo electrónico al cliente.
   * Campo opcional (puede ser `NULL` si aún no se ha enviado).
   */
  @Column({ name: 'emailed_at', type: 'timestamptz', nullable: true })
  emailedAt?: Date | null;

  /**
   * Fecha de creación del registro en la base de datos.
   * Se establece automáticamente al insertar la factura.
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
