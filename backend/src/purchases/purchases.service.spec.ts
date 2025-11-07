import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesRepository } from './purchases.repository';
import { PurchasesService } from './purchases.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from 'src/courses/entities/course.entity';

describe('PurchasesService', () => {
  let service: PurchasesService;
  let repoMock: {
    findUserPurchase: jest.Mock;
    createBasicPurchase: jest.Mock;
  };
  let courseRepoMock: { findOne: jest.Mock };

  beforeEach(async () => {
    repoMock = {
      findUserPurchase: jest.fn(),
      createBasicPurchase: jest.fn(),
    };
    courseRepoMock = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: PurchasesRepository, useValue: repoMock },
        { provide: getRepositoryToken(Course), useValue: courseRepoMock },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasUserPurchasedCourse', () => {
    it('returns true when repository finds a purchase', async () => {
      repoMock.findUserPurchase.mockResolvedValue({ id: 'purchase-id' });

      const result = await service.hasUserPurchasedCourse(1, 2);

      expect(repoMock.findUserPurchase).toHaveBeenCalledWith(1, 2);
      expect(result).toBe(true);
    });

    it('returns false when repository returns null', async () => {
      repoMock.findUserPurchase.mockResolvedValue(null);

      const result = await service.hasUserPurchasedCourse(3, 4);

      expect(repoMock.findUserPurchase).toHaveBeenCalledWith(3, 4);
      expect(result).toBe(false);
    });
  });

  describe('registerPurchase', () => {
    it('delegates creation to the repository', async () => {
      const savedPurchase = { id: 'uuid', user: { id: 5 }, course: { id: 9 } };
      repoMock.createBasicPurchase.mockResolvedValue(savedPurchase);

      const result = await service.registerPurchase(5, 9);

      expect(repoMock.createBasicPurchase).toHaveBeenCalledWith(5, 9);
      expect(result).toBe(savedPurchase);
    });
  });

  describe('getCourseDetails', () => {
    it('returns course title and price when found', async () => {
      courseRepoMock.findOne.mockResolvedValue({
        title: 'Curso Alpha',
        price: '49.99',
      });

      const result = await service.getCourseDetails(12);

      expect(courseRepoMock.findOne).toHaveBeenCalledWith({
        where: { id: 12 },
        select: ['title', 'price'],
      });
      expect(result).toEqual({ title: 'Curso Alpha', price: 49.99 });
    });

    it('throws when course is missing', async () => {
      courseRepoMock.findOne.mockResolvedValue(null);
      await expect(service.getCourseDetails(99)).rejects.toThrow(
        'No se encontró el curso con ID 99',
      );
    });
  });
});
