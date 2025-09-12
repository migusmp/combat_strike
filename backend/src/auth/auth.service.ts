import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto) {
    // Comprobar si ya existe un usuario con el mismo correo
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('El correo ya está en uso');
    }
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear el usuario y guardarlo en la base de datos
    const createdUser = this.userRepository.create({
      name: registerDto.name,
      second_name: registerDto.second_name,
      email: registerDto.email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(createdUser);
    return {
      message: 'Usuario registrado correctamente',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        second_name: savedUser.second_name,
        email: savedUser.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    // Lógica de login aquí
    return { message: 'Usuario logueado correctamente' };
  }
}
