import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

const sendMailMock = jest.fn();

jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: (...args: any[]) => sendMailMock(...args),
    }),
  };
});

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
    sendMailMock.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send reset password email', async () => {
    sendMailMock.mockResolvedValueOnce(true);

    await service.sendResetPasswordEmail('test@example.com', 'token123');

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: expect.stringContaining('Restablecer contraseña'),
        html: expect.stringContaining('token123'),
      }),
    );
  });

  it('should send verification email', async () => {
    sendMailMock.mockResolvedValueOnce(true);

    await service.sendVerificationEmail('test@example.com', 'token456');

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: expect.stringContaining('Verifica tu correo'),
        html: expect.stringContaining('token456'),
      }),
    );
  });

  it('should throw if sendMail fails', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('SMTP error'));

    await expect(
      service.sendVerificationEmail('fail@example.com', 'token789'),
    ).rejects.toThrow('SMTP error');
  });
});
