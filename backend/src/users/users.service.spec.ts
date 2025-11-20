import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from 'src/purchases/entities/purchases.entity';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;
  let purchasesRepository: jest.Mocked<Repository<Purchase>>;

  const createRepositoryMock = (): Partial<Repository<User>> => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  });

  const createPurchasesRepositoryMock = (): Partial<Repository<Purchase>> => ({
    find: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createRepositoryMock(),
        },
        {
          provide: getRepositoryToken(Purchase),
          useValue: createPurchasesRepositoryMock(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;
    purchasesRepository = module.get<Repository<Purchase>>(
      getRepositoryToken(Purchase),
    ) as jest.Mocked<Repository<Purchase>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test',
        second_name: 'User',
        isVerified: true,
        role: 'user',
      } as User;

      repository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['id', 'email', 'name', 'second_name', 'isVerified', 'role'],
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPurchasedCourses', () => {
    it('should map purchases result', async () => {
      const purchaseDate = new Date();
      const purchases = [
        {
          id: 'purchase-1',
          createdAt: purchaseDate,
          provider: 'paypal',
          status: 'COMPLETED',
          amount: 59.99 as unknown as number,
          externalOrderId: 'external-123',
          course: { id: 10, title: 'Course 1' },
        },
        {
          id: 'purchase-2',
          createdAt: purchaseDate,
          provider: 'stripe',
          status: 'PENDING',
          amount: undefined,
          externalOrderId: undefined,
          course: { id: 11, title: 'Course 2' },
        },
      ] as Purchase[];

      purchasesRepository.find.mockResolvedValue(purchases);

      const result = await service.getPurchasedCourses(42);

      expect(purchasesRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 42 } },
        relations: ['course'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([
        {
          purchaseId: 'purchase-1',
          purchasedAt: purchaseDate,
          provider: 'paypal',
          status: 'COMPLETED',
          amount: 59.99,
          externalOrderId: 'external-123',
          course: { id: 10, title: 'Course 1' },
        },
        {
          purchaseId: 'purchase-2',
          purchasedAt: purchaseDate,
          provider: 'stripe',
          status: 'PENDING',
          amount: null,
          externalOrderId: null,
          course: { id: 11, title: 'Course 2' },
        },
      ]);
    });
  });

  describe('update', () => {
    it('should update user fields without hashing when no password is provided', async () => {
      const existing = {
        id: 1,
        email: 'test@example.com',
        name: 'Old',
        second_name: 'User',
        isVerified: true,
        role: 'user',
      } as User;

      const dto = { name: 'New name' } as any;

      const findSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(existing);

      repository.save.mockImplementation(async (u: User) => u);

      const result = await service.update(1, dto);

      expect(findSpy).toHaveBeenCalledWith(1);
      expect(repository.save).toHaveBeenCalledWith(existing);
      expect(result).toEqual({
        ...existing,
        name: 'New name',
      });
    });

    it('should hash password when provided before saving', async () => {
      const existing = {
        id: 1,
        email: 'test@example.com',
        name: 'Old',
        second_name: 'User',
        isVerified: true,
        role: 'user',
      } as User;

      const dto = { password: 'plain-secret' } as any;

      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      const hashSpy = bcrypt.hash as jest.Mock;
      hashSpy.mockResolvedValue('hashed-secret');

      repository.save.mockImplementation(async (u: User) => u);

      const result = await service.update(1, dto);

      expect(hashSpy).toHaveBeenCalledWith('plain-secret', 10);
      expect(existing.password).toBeDefined();
      expect(existing.password).not.toBe('plain-secret');
      expect(repository.save).toHaveBeenCalledWith(existing);
      expect(result).toEqual(existing);
    });

    it('should propagate NotFoundException from findOne', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Usuario no encontrado'));

      await expect(service.update(999, {} as any)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
