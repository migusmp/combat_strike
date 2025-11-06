import { IsEmail, IsEnum, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  /**
   * Nombre del usuario.
   */
  @IsString()
  @MaxLength(50)
  name: string;

  /**
   * Segundo nombre o apellido del usuario.
   */
  @IsString()
  @MaxLength(50)
  second_name: string;

  /**
   * Correo electrónico único del usuario.
   */
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  email: string;

  /**
   * Contraseña en texto plano (se encriptará antes de guardar).
   */
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(32, { message: 'La contraseña no puede superar los 32 caracteres' })
  password: string;

  /**
   * Rol opcional (por defecto será "user").
   */
  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser "user" o "admin"' })
  role?: UserRole;
}
