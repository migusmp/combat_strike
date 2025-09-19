import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string = '';

  @IsNotEmpty({ message: 'El/Los apellidos es obligatorio' })
  second_name: string = '';

  @IsEmail({}, { message: 'El correo no es válido' })
  email: string = '';

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  password: string = '';
}
