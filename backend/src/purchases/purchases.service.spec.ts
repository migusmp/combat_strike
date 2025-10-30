import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesRepository } from './purchases.repository';
import { PurchasesService } from './purchases.service';

describe('PurchasesService', () => {
  let service: PurchasesService;
  let repoMock: {
    findUserPurchase: jest.Mock;
    createPurchase: jest.Mock;
  };

  beforeEach(async () => {
    repoMock = {
      findUserPurchase: jest.fn(),
      createPurchase: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: PurchasesRepository, useValue: repoMock },
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
      repoMock.createPurchase.mockResolvedValue(savedPurchase);

      const result = await service.registerPurchase(5, 9);

      expect(repoMock.createPurchase).toHaveBeenCalledWith(5, 9);
      expect(result).toBe(savedPurchase);
    });
  });
});
