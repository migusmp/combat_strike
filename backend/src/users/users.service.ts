import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    // Verificar si el email ya existe
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) throw new BadRequestException('El correo ya está registrado');

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find({
      select: ['id', 'name', 'second_name', 'email', 'isVerified', 'role'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'second_name', 'isVerified', 'role'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findOneByIdAndEmail(id: number, email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'isVerified', 'role'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.usersRepository.remove(user);
    return { message: 'Usuario eliminado correctamente' };
  }
}
