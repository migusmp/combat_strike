import { PaymentsService } from './payments.service';

const createOrderMock = jest.fn();
const captureOrderMock = jest.fn();

jest.mock('@paypal/paypal-server-sdk', () => {
  const actual = jest.requireActual('@paypal/paypal-server-sdk');
  return {
    ...actual,
    Client: jest.fn().mockImplementation(() => ({})),
    OrdersController: jest.fn().mockImplementation(() => ({
      createOrder: createOrderMock,
      captureOrder: captureOrderMock,
    })),
  };
});

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PAYPAL_CLIENT_ID = 'client-id';
    process.env.PAYPAL_CLIENT_SECRET = 'client-secret';
    process.env.NODE_ENV = 'test';
    service = new PaymentsService();
  });

  it('should create a PayPal order with intent capture and parse the response', async () => {
    const payload = { id: 'ORDER123', status: 'CREATED' };
    createOrderMock.mockResolvedValueOnce({
      body: JSON.stringify(payload),
    });

    const result = await service.createOrder('59.99', 'EUR');

    expect(createOrderMock).toHaveBeenCalledWith({
      body: {
        intent: expect.anything(),
        purchaseUnits: [
          {
            amount: {
              currencyCode: 'EUR',
              value: '59.99',
            },
          },
        ],
      },
    });
    expect(result).toEqual(payload);
  });

  it('should capture a PayPal order and return parsed payload', async () => {
    const payload = { id: 'CAPTURE123', status: 'COMPLETED' };
    captureOrderMock.mockResolvedValueOnce({
      body: JSON.stringify(payload),
    });

    const result = await service.captureOrder('ORDER123');

    expect(captureOrderMock).toHaveBeenCalledWith({
      id: 'ORDER123',
      body: {},
    });
    expect(result).toEqual(payload);
  });

  it('should create mock orders with predictable shape', () => {
    const result = service.createMockOrder('12.34', 'USD', {
      userId: 9,
      courseId: 3,
    });

    expect(result).toMatchObject({
      status: 'CREATED',
      test: true,
      amount: {
        value: '12.34',
        currency_code: 'USD',
      },
      metadata: { userId: 9, courseId: 3 },
    });
    expect(result.id).toMatch(/^TEST-/);
    expect(result.createdAt).toBeDefined();
  });

  it('should create mock captures referencing provided ids', () => {
    const result = service.captureMockOrder('ORDER123', {
      courseId: 42,
      userId: 7,
      amount: 25,
    });

    expect(result).toMatchObject({
      id: 'ORDER123',
      status: 'COMPLETED',
      test: true,
      courseId: 42,
      userId: 7,
      amount: 25,
    });
    expect(result.captureTime).toBeDefined();
  });
});
