import { IsEmail } from 'class-validator';

/**
 * Payload used to initiate a password reset request.
 */
export class ForgotPasswordDto {
  /**
   * Account e-mail that will receive the reset instructions.
   */
  @IsEmail()
  email: string = '';
}
