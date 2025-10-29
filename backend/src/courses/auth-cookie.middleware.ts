// src/courses/auth-cookie.middleware.ts
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/types/express';

@Injectable()
export class AuthCookieMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.auth;
    if (!token) throw new UnauthorizedException('No autorizado');

    try {
      const secret = process.env.JWTSECRET;
      if (!secret) throw new Error('JWTSECRET no definido');

      const payload = jwt.verify(token, secret);
      req.user = payload as User;
      next();
    } catch (err) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
