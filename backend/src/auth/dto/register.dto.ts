import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * Payload required to create a new end user account.
 */
export class RegisterDto {
  /**
   * Given name of the registering user.
   */
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string = '';

  /**
   * Last name(s) of the registering user.
   */
  @IsNotEmpty({ message: 'El/Los apellidos es obligatorio' })
  second_name: string = '';

  /**
   * Unique e-mail address used as primary credential.
   */
  @IsEmail({}, { message: 'El correo no es válido' })
  email: string = '';

  /**
   * Password that will be hashed and stored on registration.
   */
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  password: string = '';
}
