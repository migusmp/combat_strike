import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],
  exports: [MailService], // 👈 necesario para que otros módulos lo usen
})
export class MailModule {}
