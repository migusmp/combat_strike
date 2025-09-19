import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.authService.login(loginDto);

    res.clearCookie('auth', { path: '/' });

    // Guardamos JWT en cookie HttpOnly
    res.cookie('auth', token, {
      httpOnly: true,
      secure: false, // true en producción con HTTPS
      maxAge: 1000 * 60 * 60, // 1 hora
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Usuario logueado correctamente' };
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token inválido');
    }

    // Llamamos al servicio que valida el token
    try {
      const result = await this.authService.verifyUser(token);
      return result; // { message: 'Cuenta verificada correctamente' }
    } catch (error: unknown) {
      throw new BadRequestException(
        (error as Error).message || 'Error al verificar la cuenta',
      );
    }
  }

  // Valida si el token en la cookie es válido
  @Get('validate')
  async validate(@Req() req: Request) {
    const token: string = req.cookies['auth'];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const user = await this.authService.validateToken(token);
    return { isAuthenticated: true, user };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto.email);
    if (!result) {
      throw new BadRequestException('No existe un usuario con ese correo.');
    }
    return { message: 'Correo de recuperación enviado correctamente.' };
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    await this.authService.resetPassword(token, password);
    return { message: 'Contraseña restablecida correctamente.' };
  }
}
