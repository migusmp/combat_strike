import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { MailService } from '../mail/mail.service';

describe('ContactService', () => {
  let service: ContactService;
  const mailServiceMock = {
    sendContactEmail: jest.fn(),
  } as jest.Mocked<MailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: MailService, useValue: mailServiceMock },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    mailServiceMock.sendContactEmail.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate sendContactEmail to MailService', async () => {
    mailServiceMock.sendContactEmail.mockResolvedValueOnce(true as any);

    const payload = {
      name: 'Tester',
      email: 'tester@example.com',
      subject: 'Hi',
      message: 'Message',
    };

    const result = await service.sendContactEmail(payload);

    expect(mailServiceMock.sendContactEmail).toHaveBeenCalledWith(
      'Tester',
      'tester@example.com',
      'Hi',
      'Message',
    );
    expect(result).toEqual({ ok: true });
  });
});
