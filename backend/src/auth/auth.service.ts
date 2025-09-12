import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VerificationToken)
    private readonly tokenRepository: Repository<VerificationToken>,
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
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user)
      throw new UnauthorizedException('Correo o contraseña incorrectos');

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
}
