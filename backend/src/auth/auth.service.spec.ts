import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

// Tipo para los métodos que vamos a mockear
type MockRepository<T = any> = {
  findOne: jest.Mock<any, any>;
  create: jest.Mock<any, any>;
  save: jest.Mock<any, any>;
};

// Función para crear un mock del repositorio
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it('should register a new user successfully', async () => {
    userRepository.findOne.mockResolvedValue(undefined); // No existe usuario

    // Mock de create devuelve un objeto "user" base
    userRepository.create.mockImplementation((dto: Partial<User>): Partial<User> => dto);

    // Mock de save añade el id
    userRepository.save.mockImplementation(async user => {
      return { ...user, id: 1 };
    });

    const registerDto = {
      name: 'Miguel',
      second_name: 'Martinez',
      email: 'miguel@test.com',
      password: '1234',
    };

    // Llamada al servicio
    const result = await service.register(registerDto);

    // 🔑 Usar la respuesta que proviene de save para extraer el id
    expect(result).toEqual({
      message: 'Usuario registrado correctamente',
      user: {
        id: 1,
        name: 'Miguel',
        second_name: 'Martinez',
        email: 'miguel@test.com',
      },
    });

    expect(userRepository.save).toHaveBeenCalled();
  });

  it('should throw error if email is already in use', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'miguel@test.com',
    });

    const registerDto = {
      name: 'Miguel',
      second_name: 'Martinez',
      email: 'miguel@test.com',
      password: '1234',
    };

    await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
  });
});
