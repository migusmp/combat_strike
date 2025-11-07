import { BadRequestException } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PurchasesService } from 'src/purchases/purchases.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: jest.Mocked<PaymentsService>;
  let purchasesService: jest.Mocked<PurchasesService>;

  beforeEach(() => {
    paymentsService = {
      createOrder: jest.fn(),
      captureOrder: jest.fn(),
      createMockOrder: jest.fn(),
      captureMockOrder: jest.fn(),
    } as unknown as jest.Mocked<PaymentsService>;

    purchasesService = {
      registerExternalPurchase: jest.fn(),
    } as unknown as jest.Mocked<PurchasesService>;

    process.env.NODE_ENV = 'test';
    controller = new PaymentsController(paymentsService, purchasesService);
  });

  describe('createOrder', () => {
    it('should delegate to service and return subset of data', async () => {
      paymentsService.createOrder.mockResolvedValueOnce({
        id: 'ORDER1',
        status: 'CREATED',
        links: [],
        extra: 'ignore',
      } as any);

      const response = await controller.createOrder('59.99', 'EUR');

      expect(paymentsService.createOrder).toHaveBeenCalledWith('59.99', 'EUR');
      expect(response).toEqual({
        id: 'ORDER1',
        status: 'CREATED',
        links: [],
      });
    });

    it('should throw when total is missing', async () => {
      await expect(controller.createOrder('' as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('captureOrder', () => {
    const baseRequest = {
      user: { id: 7 },
    } as any;

    it('should capture order and register purchase when completed', async () => {
      paymentsService.captureOrder.mockResolvedValueOnce({
        id: 'CAPTURE1',
        status: 'COMPLETED',
        purchase_units: [
          {
            payments: {
              captures: [
                {
                  amount: { value: '59.99' },
                },
              ],
            },
          },
        ],
      } as any);

      const response = await controller.captureOrder(
        'ORDER1',
        10,
        baseRequest,
      );

      expect(paymentsService.captureOrder).toHaveBeenCalledWith('ORDER1');
      expect(purchasesService.registerExternalPurchase).toHaveBeenCalledWith({
        userId: 7,
        courseId: 10,
        paypalOrderId: 'CAPTURE1',
        amount: '59.99',
        status: 'COMPLETED',
        provider: 'paypal',
      });
      expect(response).toMatchObject({
        message: expect.stringContaining('Compra registrada'),
      });
    });

    it('should skip purchase registration when capture not completed', async () => {
      paymentsService.captureOrder.mockResolvedValueOnce({
        id: 'CAPTURE2',
        status: 'PENDING',
      } as any);

      const response = await controller.captureOrder(
        'ORDER2',
        12,
        baseRequest,
      );

      expect(purchasesService.registerExternalPurchase).not.toHaveBeenCalled();
      expect(response).toMatchObject({
        message: 'Pago no completado ❌',
      });
    });
  });

  describe('mock endpoints', () => {
    it('should create mock order without contacting PayPal', () => {
      paymentsService.createMockOrder.mockReturnValueOnce({
        id: 'TEST-1',
      } as any);

      const response = controller.createMockOrder('10', 'EUR', 3, {
        user: { id: 8 },
      } as any);

      expect(paymentsService.createMockOrder).toHaveBeenCalledWith('10', 'EUR', {
        courseId: 3,
        userId: 8,
      });
      expect(response).toEqual({ id: 'TEST-1' });
    });

    it('should capture mock order and register purchase', async () => {
      paymentsService.captureMockOrder.mockReturnValueOnce({
        id: 'TEST-1',
        status: 'COMPLETED',
      } as any);

      const response = await controller.captureMockOrder(
        'TEST-1',
        5,
        20,
        9,
        { user: { id: 3 } } as any,
      );

      expect(paymentsService.captureMockOrder).toHaveBeenCalledWith(
        'TEST-1',
        {
          courseId: 5,
          userId: 9,
          amount: 20,
        },
      );
      expect(purchasesService.registerExternalPurchase).toHaveBeenCalledWith({
        userId: 9,
        courseId: 5,
        paypalOrderId: 'TEST-1',
        amount: 20,
        status: 'COMPLETED',
        provider: 'paypal-mock',
      });
      expect(response).toEqual({
        id: 'TEST-1',
        status: 'COMPLETED',
      });
    });
  });
});
