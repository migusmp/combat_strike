import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { MailService } from '../mail/mail.service'; // 👈 importamos el servicio

import { v4 as uuidv4 } from 'uuid'; // para tokens temporales
import { VerificationToken } from './entities/verificationToken.entity';
import { PasswordResetToken } from './entities/forgotPasswordToken.entity';

import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VerificationToken)
    private readonly tokenRepository: Repository<VerificationToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetRepository: Repository<PasswordResetToken>, // 👈 nuevo
    private readonly mailService: MailService,
  ) { }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('El correo ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const createdUser = this.userRepository.create({
      name: registerDto.name,
      second_name: registerDto.second_name,
      email: registerDto.email,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(createdUser);

      // 🔹 Generamos y guardamos el token de verificación
      const token = uuidv4();
      const verificationToken = this.tokenRepository.create({
        token,
        user: savedUser,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hora
      });
      await this.tokenRepository.save(verificationToken);

      // 🔹 Enviamos el email
      await this.mailService.sendVerificationEmail(savedUser.email, token);

      return {
        message: 'Usuario registrado. Revisa tu correo para verificar la cuenta.',
        user: {
          id: savedUser.id,
          name: savedUser.name,
          second_name: savedUser.second_name,
          email: savedUser.email,
        },
      };
    } catch (e) {
      console.error('Error saving user:', e);
      throw new InternalServerErrorException('Error al registrar el usuario');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user)
      throw new UnauthorizedException('No existe ninguna cuenta con este correo');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException('Correo o contraseña incorrectos');

    // Verificar si el usuario ha confirmado su correo
    if (!user.isVerified) {
      // Buscamos el token de verificación asociado al usuario
      const tokenRecord = await this.tokenRepository.findOne({
        where: { user: { id: user.id } },
      });

      let tiempoRestante = '';
      if (tokenRecord) {
        const now = new Date();
        const diffMs = tokenRecord.expiresAt.getTime() - now.getTime();
        if (diffMs > 0) {
          const diffMinutes = Math.floor(diffMs / 1000 / 60);
          tiempoRestante = `Te queda ${diffMinutes} minutos para verificar tu correo.`;
        } else {
          tiempoRestante = 'El enlace de verificación ha expirado.';
        }
      }

      throw new UnauthorizedException(
        `Debes verificar tu correo antes de iniciar sesión. ${tiempoRestante}`,
      );
    }

    // Generamos JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' },
    );

    return { user, token };
  }

  async verifyUser(token: string) {
    const verificationToken = await this.tokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!verificationToken) {
      throw new BadRequestException('Token inválido');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Token expirado');
    }

    // Marcamos al usuario como verificado
    verificationToken.user.isVerified = true;
    await this.userRepository.save(verificationToken.user);

    // Eliminamos el token de la DB
    await this.tokenRepository.delete(verificationToken.id);

    return { message: 'Cuenta verificada correctamente' };
  }

  async validateToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET! || 'secret');
      return decoded; // aquí puedes devolver el userId, email, etc.
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // 🔹 Método para enviar correo de recuperación
  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return false;

    // Generar token aleatorio
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    const resetToken = this.passwordResetRepository.create({
      user,
      token,
      expiresAt,
    });
    await this.passwordResetRepository.save(resetToken);

    // Enviar correo con link de recuperación
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.mailService.sendResetPasswordEmail(user.email, resetLink);

    return true;
  }

  // 🔹 Método para resetear la contraseña usando el token
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const resetToken = await this.passwordResetRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!resetToken) {
      throw new BadRequestException('Sesión expirada o token inválido');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Token expirado');
    }

    // Actualizar contraseña
    resetToken.user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(resetToken.user);

    // Eliminar token para que no se reutilice
    await this.passwordResetRepository.delete(resetToken.id);

    return true;
  }
}
