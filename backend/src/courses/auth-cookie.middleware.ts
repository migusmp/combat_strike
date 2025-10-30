// src/courses/auth-cookie.middleware.ts

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/types/express';

/**
 * Middleware encargado de autenticar peticiones HTTP
 * mediante una cookie que contiene un token JWT.
 *
 * Este middleware se aplica únicamente a las rutas que lo requieran
 * (configuradas en `CoursesModule`) y se ejecuta **antes** del controlador.
 *
 * Su función principal es:
 * 1️⃣ Leer la cookie `auth` enviada por el cliente.  
 * 2️⃣ Verificar y decodificar el token JWT.  
 * 3️⃣ Inyectar los datos del usuario (`req.user`) en la request.  
 *
 * Si el token no existe o no es válido, lanza un `UnauthorizedException (401)`.
 */
@Injectable()
export class AuthCookieMiddleware implements NestMiddleware {
  /**
   * Método principal del middleware que intercepta la request
   * antes de llegar al controlador.
   *
   * @param req - Objeto `Request` de Express (permite acceder a cookies y cabeceras).
   * @param res - Objeto `Response` de Express (no se utiliza en este caso).
   * @param next - Función que transfiere el control al siguiente middleware o controlador.
   *
   * @throws `UnauthorizedException` si no hay cookie `auth` o el token es inválido.
   *
   * @example
   * ```
   * // Ejemplo de cookie esperada:
   * // Cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *
   * // Tras pasar por este middleware:
   * req.user = { id: 1, email: "usuario@correo.com", role: "admin" }
   * ```
   */
  use(req: Request, res: Response, next: NextFunction) {
    // 1️⃣ Obtener el token JWT desde la cookie 'auth'
    const token = req.cookies?.auth;
    if (!token) throw new UnauthorizedException('No autorizado');

    try {
      // 2️⃣ Verificar que la variable de entorno con la clave JWT exista
      const secret = process.env.JWTSECRET;
      if (!secret) throw new Error('JWTSECRET no definido');

      // 3️⃣ Validar y decodificar el token usando la clave secreta
      const payload = jwt.verify(token, secret);

      // 4️⃣ Inyectar los datos del usuario en la request
      req.user = payload as User;

      // 5️⃣ Continuar con la siguiente capa del flujo
      next();
    } catch (err) {
      // Si el token es inválido, ha expirado o hay un error de verificación
      throw new UnauthorizedException('Token inválido');
    }
  }
}
