import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const createRepositoryMock = (): Partial<Repository<User>> => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createRepositoryMock(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;
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
});
