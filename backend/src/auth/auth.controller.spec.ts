import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('logout', () => {
    it('should throw UnauthorizedException if no cookie exists', async () => {
      const req = { cookies: {} } as unknown as Request;
      const res = { clearCookie: jest.fn() } as unknown as Response;

      await expect(controller.logout(req, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should clear the auth cookie if it exists and return success message', async () => {
      const clearCookieMock = jest.fn();
      const req = { cookies: { auth: 'token' } } as unknown as Request;
      const res = { clearCookie: clearCookieMock } as unknown as Response;

      const result = await controller.logout(req, res);

      expect(clearCookieMock).toHaveBeenCalledWith('auth', { path: '/' });
      expect(result).toEqual({ message: 'Usuario desconectado correctamente' });
    });
  });
});
