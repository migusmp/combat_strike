import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Request } from 'express';
import { RequestUser } from 'src/types/request';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Obtiene la información del usuario actualmente autenticado.
   *
   * 🔒 Este endpoint requiere autenticación mediante el middleware `AuthCookieMiddleware`,
   * que extrae el token JWT de la cookie `auth` y adjunta el objeto `user` en `req.user`.
   *
   * @route GET /users/me
   * @param req - Objeto `Request` de Express, extendido con la propiedad `user` (establecida por el middleware de autenticación).
   * @returns Los datos del usuario autenticado (sin incluir la contraseña).
   *
   * @throws ForbiddenException Si el usuario no está autenticado o su información no se encuentra en la base de datos.
   *
   * @example
   * // Petición:
   * GET /users/me
   * Cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *
   * // Respuesta:
   * {
   *   "id": 1,
   *   "email": "miguel@combatstrike.es",
   *   "name": "Miguel",
   *   "second_name": "Martínez",
   *   "isVerified": true,
   *   "role": "user"
   * }
   */
  @Get('me')
  async getProfile(@Req() req: Request) {
    // ✅ Extrae el usuario autenticado del request (inyectado por AuthCookieMiddleware)
    const loggedUser = req.user as RequestUser | undefined;

    // ❌ Si no existe el usuario (no autenticado o token inválido)
    if (!loggedUser) {
      throw new ForbiddenException('No autorizado');
    }

    try {
      // 🔍 Busca al usuario en la base de datos usando su ID del token JWT
      const user = await this.usersService.findOne(loggedUser.id);

      // ❌ Si no se encuentra el usuario (por ejemplo, fue eliminado)
      if (!user) {
        throw new ForbiddenException('Usuario no encontrado');
      }

      // ✅ Devuelve los datos del usuario (sin contraseña, el servicio ya la excluye)
      return user;
    } catch (error) {
      // 🚫 Si ocurre cualquier error inesperado, se lanza excepción de autorización
      throw new ForbiddenException('No autorizado');
    }
  }

  /**
   * Obtiene los cursos comprados por el usuario autenticado.
   *
   * @route GET /users/me/courses
   */
  @Get('me/courses')
  async getPurchasedCourses(@Req() req: Request) {
    const loggedUser = req.user as RequestUser | undefined;

    if (!loggedUser) {
      throw new ForbiddenException('No autorizado');
    }

    return this.usersService.getPurchasedCourses(loggedUser.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Patch('update/me')
  async updateMe(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const loggedUser = req.user as RequestUser;
    console.log("Usuario que quiere actualizar informacion:",loggedUser);

    if (!loggedUser) {
      throw new ForbiddenException('No autorizado');
    }

    return this.usersService.update(loggedUser.id, updateUserDto);
  }
}
