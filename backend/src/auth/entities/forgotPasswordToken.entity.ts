import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Persists password reset tokens to validate recovery requests.
 */
@Entity('password_reset_tokens')
export class PasswordResetToken {
  /**
   * Primary identifier generated for the reset request.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Random token delivered to the user.
   */
  @Column()
  token!: string;

  /**
   * Expiration timestamp that invalidates the token after its lifetime.
   */
  @Column()
  expiresAt!: Date;

  /**
   * Owner of the reset request.
   */
  @ManyToOne(() => User)
  user!: User;
}
