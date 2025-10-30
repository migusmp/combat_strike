import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

/**
 * Stores one-time verification tokens that allow users to activate their accounts.
 */
@Entity('verification_tokens')
export class VerificationToken {
  /**
   * Primary identifier generated for the token record.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Token delivered to the user via e-mail.
   */
  @Column()
  token!: string;

  /**
   * Foreign key referencing the owning user.
   */
  @Column()
  userId!: number;

  /**
   * User entity linked to this token. The row is removed when the user is deleted.
   */
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user!: User;

  /**
   * Expiration timestamp after which the token becomes invalid.
   */
  @Column()
  expiresAt!: Date;
}
