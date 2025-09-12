import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

    // Guardamos JWT en cookie HttpOnly
    res.cookie('auth', token, {
      httpOnly: true,
      secure: false, // true en producción con HTTPS
      maxAge: 1000 * 60 * 60, // 1 hora
      sameSite: 'lax',
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
    } catch (error) {
      // Si hay error, lo lanzamos como BadRequest
      throw new BadRequestException(
        error.message || 'Error al verificar la cuenta',
      );
    }
  }
}
