import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: { findOne: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    const mockRequest = (user?: { id: number }) => ({ user }) as any;

    it('should return the authenticated user profile', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test',
        second_name: 'User',
        isVerified: true,
        role: 'user',
      };
      usersService.findOne.mockResolvedValue(user);

      const result = await controller.getProfile(mockRequest({ id: 1 }));

      expect(usersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });

    it('should throw ForbiddenException when request has no user', async () => {
      await expect(controller.getProfile(mockRequest())).rejects.toThrow(
        ForbiddenException,
      );
      expect(usersService.findOne).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when service fails', async () => {
      usersService.findOne.mockRejectedValue(new Error('boom'));

      await expect(
        controller.getProfile(mockRequest({ id: 1 })),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
