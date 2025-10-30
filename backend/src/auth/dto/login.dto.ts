import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * Credentials supplied during the login flow.
 */
export class LoginDto {
  /**
   * Registered e-mail address.
   */
  @IsNotEmpty({ message: 'Campo de correo vacío' })
  @IsEmail({}, { message: 'El correo no es válido' })
  email: string = '';

  /**
   * Plain-text password that will be validated against the stored hash.
   */
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string = '';
}
