import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { VerificationToken } from './entities/verificationToken.entity';
import { PasswordResetToken } from './entities/forgotPasswordToken.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import * as jwt from 'jsonwebtoken';

// Tipo para los métodos que vamos a mockear
type MockRepository<T = any> = {
  findOne: jest.Mock<any, any>;
  create: jest.Mock<any, any>;
  save: jest.Mock<any, any>;
  delete: jest.Mock<any, any>;
};

// Función para crear un mock del repositorio
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

// Mock del MailService
const mockMailService = {
  sendVerificationEmail: jest.fn(),
  sendResetPasswordEmail: jest.fn(),
};

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockRepository<User>;
  let tokenRepository: MockRepository<VerificationToken>;
  let passwordResetRepository: MockRepository<PasswordResetToken>;
  let signSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: createMockRepository<User>() },
        { provide: getRepositoryToken(VerificationToken), useValue: createMockRepository<VerificationToken>() },
        { provide: getRepositoryToken(PasswordResetToken), useValue: createMockRepository<PasswordResetToken>() },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    tokenRepository = module.get<MockRepository<VerificationToken>>(getRepositoryToken(VerificationToken));
    passwordResetRepository = module.get<MockRepository<PasswordResetToken>>(getRepositoryToken(PasswordResetToken));
    // Mock de jwt.sign
    signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('mocked-jwt-token');
  });

  afterEach(() => {
    signSpy.mockRestore(); // restaurar para otros tests
  });

  it('should register a new user successfully', async () => {
    userRepository.findOne.mockResolvedValue(undefined);
    userRepository.create.mockImplementation(dto => dto);
    userRepository.save.mockImplementation(async user => ({ ...user, id: 1 }));

    tokenRepository.create.mockImplementation(dto => dto);
    tokenRepository.save.mockImplementation(async token => ({ ...token, id: 1 }));

    mockMailService.sendVerificationEmail.mockResolvedValue(true);


    const registerDto = {
      name: 'test',
      second_name: 'test',
      email: 'test@example.com',
      password: '1234',
    };

    const result = await service.register(registerDto);

    expect(result).toEqual({
      message: 'Usuario registrado. Revisa tu correo para verificar la cuenta.',
      user: {
        id: 1,
        name: 'test',
        second_name: 'test',
        email: 'test@example.com',
      },
    });

    expect(userRepository.save).toHaveBeenCalled();
    expect(tokenRepository.save).toHaveBeenCalled();
    expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
  });

  it('should throw error if email is already in use', async () => {
    userRepository.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });

    const registerDto = {
      name: 'test',
      second_name: 'test',
      email: 'test@example.com',
      password: '1234',
    };

    await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
  });

  it('should login successfully for a verified user', async () => {
    // Usuario mockeado ya verificado
    const user = {
      id: 1,
      email: 'test@example.com',
      password: await bcrypt.hash('1234', 10),
      isVerified: true,
    };
    userRepository.findOne.mockResolvedValue(user);

    // bcrypt.compare debe devolver true para simular contraseña correcta
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const loginDto = { email: 'test@example.com', password: '1234' };

    const result = await service.login(loginDto);

    expect(result.user).toEqual(user);
    expect(result.token).toBeDefined();
    expect(result.token).toBe('mocked-jwt-token'); // opcional
  });

  it('should login successfully for a verified user', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedpass',
      isVerified: true,
    };
    userRepository.findOne.mockResolvedValue(user);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const loginDto = { email: 'test@example.com', password: '1234' };
    const result = await service.login(loginDto);

    expect(result.user).toEqual(user);
    expect(result.token).toBeDefined();
  });

  it('should throw UnauthorizedException if user not found', async () => {
    userRepository.findOne.mockResolvedValue(undefined); // Simula que no existe usuario

    const loginDto = { email: 'notfound@test.com', password: '1234' };

    await expect(service.login(loginDto)).rejects.toThrow('No existe ninguna cuenta con este correo');
  });

  it('should throw UnauthorizedException if user is not verified', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      password: await bcrypt.hash('1234', 10),
      isVerified: false,
    };
    userRepository.findOne.mockResolvedValue(user);
    tokenRepository.findOne.mockResolvedValue({
      user,
      expiresAt: new Date(Date.now() + 60000),
    });

    // bcrypt.compare debe devolver true para simular contraseña correcta
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const loginDto = { email: 'test@example.com', password: '1234' };

    await expect(service.login(loginDto))
      .rejects.toThrow(/Debes verificar tu correo/);
  });

  it('should verify a user successfully', async () => {
    const user = { id: 1, isVerified: false };
    const verificationToken = {
      id: 1,
      token: 'token123',
      user,
      expiresAt: new Date(Date.now() + 1000 * 60), // todavía válido
    };

    tokenRepository.findOne.mockResolvedValue(verificationToken);
    userRepository.save.mockResolvedValue({ ...user, isVerified: true });
    tokenRepository.delete.mockResolvedValue({});

    const result = await service.verifyUser('token123');

    expect(result).toEqual({ message: 'Cuenta verificada correctamente' });
    expect(userRepository.save).toHaveBeenCalledWith({ ...user, isVerified: true });
    expect(tokenRepository.delete).toHaveBeenCalledWith(verificationToken.id);
  });

  it('should throw BadRequestException if token not found', async () => {
    tokenRepository.findOne.mockResolvedValue(undefined);
    await expect(service.verifyUser('invalid')).rejects.toThrow('Token inválido');
  });

  it('should throw BadRequestException if token expired', async () => {
    const verificationToken = { id: 1, token: 'token123', user: {}, expiresAt: new Date(Date.now() - 1000) };
    tokenRepository.findOne.mockResolvedValue(verificationToken);
    await expect(service.verifyUser('token123')).rejects.toThrow('Token expirado');
  });

  it('should generate reset token and send email', async () => {
    const user = { id: 1, email: 'test@example.com' };
    userRepository.findOne.mockResolvedValue(user);
    passwordResetRepository.create.mockImplementation(dto => dto);
    passwordResetRepository.save.mockResolvedValue({});
    mockMailService.sendResetPasswordEmail.mockResolvedValue(true);

    const result = await service.forgotPassword('test@example.com');

    expect(result).toBe(true);
    expect(passwordResetRepository.create).toHaveBeenCalled();
    expect(passwordResetRepository.save).toHaveBeenCalled();
    expect(mockMailService.sendResetPasswordEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.stringContaining('http://localhost:3000/reset-password?token='),
    );
  });

  it('should return false if email not found', async () => {
    userRepository.findOne.mockResolvedValue(undefined);
    const result = await service.forgotPassword('notfound@test.com');
    expect(result).toBe(false);
  });

  it('should reset password successfully', async () => {
    const user = { id: 1, password: 'oldpass' };
    const resetToken = { id: 1, token: 'token123', user, expiresAt: new Date(Date.now() + 1000 * 60) };

    passwordResetRepository.findOne.mockResolvedValue(resetToken);
    userRepository.save.mockResolvedValue({ ...user });
    passwordResetRepository.delete.mockResolvedValue({});

    const result = await service.resetPassword('token123', 'newpass');
    expect(result).toBe(true);
    expect(userRepository.save).toHaveBeenCalled();
    expect(passwordResetRepository.delete).toHaveBeenCalledWith(resetToken.id);
  });

  it('should throw BadRequestException if token invalid', async () => {
    passwordResetRepository.findOne.mockResolvedValue(undefined);
    await expect(service.resetPassword('invalid', 'newpass')).rejects.toThrow('Sesión expirada o token inválido');
  });

  it('should throw BadRequestException if token expired', async () => {
    const resetToken = { id: 1, token: 'token123', user: {}, expiresAt: new Date(Date.now() - 1000) };
    passwordResetRepository.findOne.mockResolvedValue(resetToken);
    await expect(service.resetPassword('token123', 'newpass')).rejects.toThrow('Token expirado');
  });

  it('should return decoded payload for valid token', async () => {
    const payload = { id: 1, email: 'test@example.com' };
    jest.spyOn(jwt, 'verify').mockReturnValue(payload);

    const result = await service.validateToken('validtoken');
    expect(result).toEqual(payload);
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('fail'); });
    await expect(service.validateToken('invalid')).rejects.toThrow('Invalid or expired token');
  });

  it('should throw BadRequestException if bcrypt.hash throws an error', async () => {
    const user = { id: 1, password: 'oldpass' };
    const resetToken = { id: 1, token: 'token123', user, expiresAt: new Date(Date.now() + 1000 * 60) };

    // Simulamos que encontramos el token
    passwordResetRepository.findOne.mockResolvedValue(resetToken);

    // Forzamos que bcrypt.hash lance un error
    (bcrypt.hash as jest.Mock).mockImplementation(() => {
      throw new Error('hash error');
    });

    await expect(service.resetPassword('token123', 'newpass')).rejects.toThrow('hash error');
  });
});
