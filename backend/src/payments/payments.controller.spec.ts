import { BadRequestException } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PurchasesService } from 'src/purchases/purchases.service';
import { InvoicesService } from 'src/invoices/invoices.service';
import { MailService } from 'src/mail/mail.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: jest.Mocked<PaymentsService>;
  let purchasesService: jest.Mocked<PurchasesService>;
  let invoicesService: jest.Mocked<InvoicesService>;
  let mailService: jest.Mocked<MailService>;

  beforeEach(() => {
    paymentsService = {
      createOrder: jest.fn(),
      captureOrder: jest.fn(),
      createMockOrder: jest.fn(),
      captureMockOrder: jest.fn(),
    } as unknown as jest.Mocked<PaymentsService>;

    purchasesService = {
      registerExternalPurchase: jest.fn(),
      getCourseDetails: jest.fn(),
    } as unknown as jest.Mocked<PurchasesService>;

    invoicesService = {
      generateInvoice: jest.fn(),
    } as unknown as jest.Mocked<InvoicesService>;

    mailService = {
      sendInvoiceEmail: jest.fn(),
    } as unknown as jest.Mocked<MailService>;

    process.env.NODE_ENV = 'test';
    controller = new PaymentsController(
      paymentsService,
      purchasesService,
      invoicesService,
      mailService,
    );
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
      user: { id: 7, name: 'User Test', email: 'user@test.com' },
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

      purchasesService.registerExternalPurchase.mockResolvedValueOnce({
        id: 'PURCHASE1',
        amount: 59.99,
        createdAt: new Date('2024-01-01'),
      } as any);
      purchasesService.getCourseDetails.mockResolvedValueOnce({
        title: 'Curso X',
        price: 59.99,
      });
      invoicesService.generateInvoice.mockResolvedValueOnce('/tmp/inv.pdf');

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
        amount: 59.99,
        status: 'COMPLETED',
        provider: 'paypal',
      });
      expect(purchasesService.getCourseDetails).toHaveBeenCalledWith(10);
      expect(invoicesService.generateInvoice).toHaveBeenCalledWith({
        user: { name: 'User Test', email: 'user@test.com' },
        course: { title: 'Curso X', price: 59.99 },
        purchase: {
          id: 'PURCHASE1',
          amount: 59.99,
          createdAt: new Date('2024-01-01'),
        },
      });
      expect(mailService.sendInvoiceEmail).toHaveBeenCalledWith(
        'user@test.com',
        '/tmp/inv.pdf',
      );
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
      expect(invoicesService.generateInvoice).not.toHaveBeenCalled();
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
      expect(invoicesService.generateInvoice).toHaveBeenCalled();
      expect(mailService.sendInvoiceEmail).toHaveBeenCalled();
      expect(response).toEqual({
        id: 'TEST-1',
        status: 'COMPLETED',
      });
    });
  });
});
