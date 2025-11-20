import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

describe('ContactController', () => {
  let controller: ContactController;
  let contactService: jest.Mocked<ContactService>;

  beforeEach(async () => {
    contactService = {
      sendContactEmail: jest.fn(),
    } as unknown as jest.Mocked<ContactService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [{ provide: ContactService, useValue: contactService }],
    }).compile();

    controller = module.get<ContactController>(ContactController);
    contactService.sendContactEmail.mockReset();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate to ContactService when payload is valid', async () => {
    const payload = {
      name: 'Tester',
      email: 'tester@example.com',
      subject: 'Hola',
      message: 'Mensaje',
    };
    contactService.sendContactEmail.mockResolvedValueOnce({ ok: true } as any);

    const response = await controller.contact(payload);

    expect(contactService.sendContactEmail).toHaveBeenCalledWith(payload);
    expect(response).toEqual({ ok: true });
  });

  it('should throw BadRequestException when fields are missing', async () => {
    await expect(
      controller.contact({
        name: 'Tester',
        email: '',
        subject: 'Hola',
        message: '',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
