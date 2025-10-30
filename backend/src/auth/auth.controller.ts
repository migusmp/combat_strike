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

/**
 * Exposes REST endpoints that orchestrate authentication flows and cookie-based session handling.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user and triggers verification e-mail dispatch.
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Authenticates a user and stores the issued JWT inside an HttpOnly cookie.
   */
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.authService.login(loginDto);

    res.clearCookie('auth', { path: '/' });

    // Store the JWT inside an HttpOnly cookie to protect it from client-side scripts
    res.cookie('auth', token, {
      httpOnly: true,
      secure: false, // Switch to true in production when HTTPS is enforced
      maxAge: 1000 * 60 * 60, // 1 hour
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Usuario logueado correctamente' };
  }

  /**
   * Confirms the verification token sent by e-mail and activates the user account.
   */
  @Get('verify')
  async verify(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token inválido');
    }

    try {
      const result = await this.authService.verifyUser(token);
      return result;
    } catch (error: unknown) {
      throw new BadRequestException(
        (error as Error).message || 'Error al verificar la cuenta',
      );
    }
  }

  /**
   * Resends the verification e-mail for accounts that are still pending activation.
   */
  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerification(email);
  }

  /**
   * Validates the cookie-issued JWT and returns the decoded user data.
   */
  @Get('validate')
  async validate(@Req() req: Request) {
    const token: string = req.cookies['auth'];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const user = await this.authService.validateToken(token);
    return { isAuthenticated: true, user };
  }

  /**
   * Initiates the password recovery flow, sending a reset link to the provided e-mail.
   */
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto.email);
    if (!result) {
      throw new BadRequestException('No existe un usuario con ese correo.');
    }
    return { message: 'Correo de recuperación enviado correctamente.' };
  }

  /**
   * Resets the password using a previously issued recovery token.
   */
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    await this.authService.resetPassword(token, password);
    return { message: 'Contraseña restablecida correctamente.' };
  }

  /**
   * Removes the authentication cookie and ends the current session.
   */
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['auth'];

    if (!token) {
      throw new UnauthorizedException('No hay sesión activa');
    }

    // Remove the authentication cookie
    res.clearCookie('auth', { path: '/' });

    return { message: 'Usuario desconectado correctamente' };
  }
}
