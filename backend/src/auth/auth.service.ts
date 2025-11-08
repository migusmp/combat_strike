import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { MailService } from '../mail/mail.service';

import { v4 as uuidv4 } from 'uuid';
import { VerificationToken } from './entities/verificationToken.entity';
import { PasswordResetToken } from './entities/forgotPasswordToken.entity';

import { randomBytes } from 'crypto';

/**
 * AuthService centralizes all authentication and account lifecycle actions.
 * It handles registration, credential validation, account verification, token
 * management, and password recovery workflows that involve e-mail delivery.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VerificationToken)
    private readonly tokenRepository: Repository<VerificationToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetRepository: Repository<PasswordResetToken>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Registers a new user, enforcing unique e-mail addresses and issuing a verification token.
   *
   * @param registerDto Incoming registration payload with personal data and credentials.
   * @returns A confirmation message together with the persisted user summary.
   * @throws BadRequestException when the e-mail address is already in use.
   * @throws InternalServerErrorException when the persistence layer fails.
   */
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

      const token = uuidv4();
      const verificationToken = this.tokenRepository.create({
        token,
        user: savedUser,
        userId: savedUser.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      });
      await this.tokenRepository.save(verificationToken);

      await this.mailService.sendVerificationEmail(savedUser.email, token);

      return {
        message:
          'Usuario registrado. Revisa tu correo para verificar la cuenta.',
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

  /**
   * Validates user credentials and issues a signed JWT.
   *
   * @param loginDto Credentials submitted by the client.
   * @returns The authenticated user entity and a signed JWT token.
   * @throws UnauthorizedException when the credentials are invalid or the account is not verified.
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user)
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException('Correo o contraseña incorrectos');

    if (!user.isVerified) {
      throw new UnauthorizedException({
        message: 'Debes verificar tu correo antes de iniciar sesión.',
        canResend: true, // Allows the frontend to display the resend action
      });
    }

    const jwtSecret = process.env.JWTSECRET || 'secret';

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '1h' },
    );

    return { user, token };
  }

  /**
   * Marks a pending account as verified when a valid verification token is provided.
   *
   * @param token Verification token delivered via e-mail.
   * @returns A confirmation message.
   * @throws BadRequestException when the token is invalid or expired.
   */
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

    verificationToken.user.isVerified = true;
    await this.userRepository.save(verificationToken.user);

    await this.tokenRepository.remove(verificationToken);

    return { message: 'Cuenta verificada correctamente' };
  }

  /**
   * Issues or refreshes a verification token and sends it to the user by e-mail.
   *
   * @param email Recipient account.
   * @returns A confirmation message to signal that the message was sent.
   * @throws NotFoundException when no user matches the e-mail address.
   * @throws BadRequestException when the account is already verified.
   */
  async resendVerification(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.isVerified) {
      throw new BadRequestException('El usuario ya está verificado');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' },
    );

    let tokenRecord = await this.tokenRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (tokenRecord) {
      tokenRecord.token = token;
      tokenRecord.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await this.tokenRepository.save(tokenRecord);
    } else {
      tokenRecord = this.tokenRepository.create({
        token,
        user,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
      await this.tokenRepository.save(tokenRecord);
    }

    await this.mailService.sendVerificationEmail(user.email, token);

    return { message: 'Correo de verificación reenviado' };
  }

  /**
   * Validates the JWT token supplied by the client.
   *
   * @param token JWT issued by the API.
   * @returns The decoded payload when the token is valid.
   * @throws UnauthorizedException when the token cannot be verified.
   */
  async validateToken(token: string) {
    try {
      const jwtSecret = process.env.JWTSECRET || 'secret';
      const decoded = jwt.verify(token, jwtSecret);
      return decoded;
    } catch (err) {
      console.error('Token validation error:', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Generates and stores a password reset token and notifies the user via e-mail.
   *
   * @param email Address associated with the account.
   * @returns True when the reset e-mail was dispatched, false when the user does not exist.
   */
  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return false;

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    const resetToken = this.passwordResetRepository.create({
      user,
      token,
      expiresAt,
    });
    await this.passwordResetRepository.save(resetToken);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.mailService.sendResetPasswordEmail(user.email, resetLink);

    return true;
  }

  /**
   * Resets a user password when a valid reset token is presented.
   *
   * @param token One-time token provided in the recovery e-mail.
   * @param newPassword New credential to be stored.
   * @returns True once the password has been successfully updated.
   * @throws BadRequestException when the token is missing, invalid, or expired.
   */
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

    resetToken.user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(resetToken.user);

    await this.passwordResetRepository.delete(resetToken.id);

    return true;
  }
}
